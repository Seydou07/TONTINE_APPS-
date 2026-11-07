/**
 * Lancement du code USSD et vérification du paiement.
 *
 * Sur Android, le code est lancé directement (appel « ACTION_CALL ») : l'utilisateur ne voit pas
 * le clavier du téléphone et ne peut donc pas modifier le montant. Il voit seulement la fenêtre
 * de son opérateur, qui lui demande son code secret. Venega ne voit jamais ce code.
 * Si l'autorisation « Passer des appels » est refusée, on retombe sur le clavier pré-rempli.
 */
import { AppState, Linking, PermissionsAndroid, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { isDemoMode } from '../../lib/api/config';
import { buildUssdCode } from './circleStore';

async function canCallDirectly(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  const permission = PermissionsAndroid.PERMISSIONS.CALL_PHONE;
  if (await PermissionsAndroid.check(permission)) return true;
  const result = await PermissionsAndroid.request(permission, {
    title: 'Lancer le paiement',
    message:
      'Venega lance le code de paiement directement, avec le montant exact. Vous n’aurez qu’à saisir votre code secret dans la fenêtre de votre opérateur.',
    buttonPositive: 'Autoriser',
    buttonNegative: 'Plus tard',
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function launchUssd(code: string, direct: boolean): Promise<void> {
  const uri = `tel:${encodeURIComponent(code)}`;
  if (direct) {
    // Pas d'attente du résultat : le retour dans l'app est détecté par AppState.
    IntentLauncher.startActivityAsync('android.intent.action.CALL', { data: uri }).catch(() => Linking.openURL(uri));
    return;
  }
  await Linking.openURL(uri);
}

/**
 * Si l'app n'a jamais été quittée ni recouverte après ce délai, le code n'a sans doute pas été lancé
 * (iOS, téléphone sans fonction d'appel…) : on passe quand même à la vérification pour ne pas rester bloqué.
 */
const NO_LEAVE_TIMEOUT_MS = 15000;

/**
 * Lance le code USSD puis se résout quand l'utilisateur revient dans l'application.
 * « Revenir » = l'app repasse au premier plan après être partie en arrière-plan, OU (Android) reprend
 * le focus après avoir été recouverte par la fenêtre de l'opérateur sans passer en arrière-plan.
 */
export async function dialAndWait(operatorId: string, amount: number): Promise<void> {
  // L'autorisation est demandée AVANT d'écouter AppState : sa fenêtre fait elle-même quitter puis
  // revenir l'app, ce qui aurait été pris pour un retour de paiement avant même le lancement du code.
  const direct = await canCallDirectly();
  const code = buildUssdCode(operatorId, amount);

  return new Promise<void>((resolve, reject) => {
    let left = false;
    let settled = false;
    const subs: { remove: () => void }[] = [];
    const cleanup = () => {
      settled = true;
      clearTimeout(fallback);
      subs.forEach((s) => s.remove());
    };
    const back = () => {
      if (settled) return;
      cleanup();
      resolve();
    };

    subs.push(
      AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          if (left) back();
        } else {
          left = true;
        }
      }),
    );
    if (Platform.OS === 'android') {
      // Fenêtre USSD affichée par-dessus l'app : pas de passage en arrière-plan, seulement blur / focus.
      subs.push(AppState.addEventListener('blur', () => (left = true)));
      subs.push(AppState.addEventListener('focus', () => left && back()));
    }
    const fallback = setTimeout(() => {
      if (!left) back();
    }, NO_LEAVE_TIMEOUT_MS);

    launchUssd(code, direct).catch((e) => {
      if (settled) return;
      cleanup();
      reject(e);
    });
  });
}

/**
 * Résultat d'un paiement, tel que le serveur le constate à partir de la confirmation de l'opérateur.
 * Un montant inférieur au montant dû n'est JAMAIS compté comme payé : il reste « partiel ».
 */
export type PaymentOutcome =
  | { status: 'COMPLETED' }
  | { status: 'PARTIAL'; received: number; missing: number }
  /** Rien reçu : solde insuffisant, code secret annulé ou erroné, réseau. */
  | { status: 'NOT_RECEIVED' };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function checkPayment(_operatorId: string, _amount: number): Promise<PaymentOutcome> {
  if (isDemoMode) {
    await wait(1500);
    return { status: 'COMPLETED' };
  }
  // TODO API : `POST /payments` avant de lancer le code (montant fixé par le serveur), puis
  // `GET /payments/:paymentId` toutes les 5 s pendant 3 min au maximum (docs/api-mobile.md §4).
  // Le serveur renvoie PARTIAL avec `received` si le montant reçu est inférieur au montant dû.
  return { status: 'NOT_RECEIVED' };
}
