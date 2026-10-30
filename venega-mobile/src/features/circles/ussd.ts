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

async function launchUssd(code: string): Promise<void> {
  const uri = `tel:${encodeURIComponent(code)}`;
  if (await canCallDirectly()) {
    // Pas d'attente du résultat : le retour dans l'app est détecté par AppState.
    IntentLauncher.startActivityAsync('android.intent.action.CALL', { data: uri }).catch(() => Linking.openURL(uri));
    return;
  }
  await Linking.openURL(uri);
}

/** Lance le code USSD puis se résout quand l'utilisateur revient dans l'application. */
export function dialAndWait(operatorId: string, amount: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        sub.remove();
        resolve();
      }
    });
    launchUssd(buildUssdCode(operatorId, amount)).catch((e) => {
      sub.remove();
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
