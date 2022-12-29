import {
  call, take,
} from 'redux-saga/effects';

import { eventChannel, END } from 'redux-saga';
import {  setSystemState } from '@app/shared/store/actions';
import { actions as mainActions } from '@app/containers/Pools/store/index';
import store from '../../../index';

import Utils from '@core/utils.js';

export function remoteEventChannel() {
  return eventChannel((emitter) => {
    Utils.initialize({
      "appname": "BEAM Faucet",
      "min_api_version": "6.2",
      "headless": false,
      "apiResultHandler": (error, result, full) => {
        console.log('api result data: ', result, full);
        store.dispatch(mainActions.setTxStatus(result))
        if (!result.error) {
          emitter(full);
        }
      }
    }, (err) => {
        Utils.download("./amm.wasm", (err, bytes) => {
            Utils.callApi("ev_subunsub", {ev_txs_changed: true, ev_system_state: true},
              (error, result, full) => {
                if (result) {
                    console.log('def')
                 store.dispatch(mainActions.loadAppParams.request(bytes));
                 store.dispatch(mainActions.loadPoolsList.request(bytes));
                 }
                }
            );
        })
    });

    const unsubscribe = () => {
      emitter(END);
    };

    return unsubscribe;
  });
}

function* sharedSaga() {
  const remoteChannel = yield call(remoteEventChannel);

  while (true) {
    try {
      const payload: any = yield take(remoteChannel);
      console.log(payload)
      switch (payload.id) {
        case 'ev_system_state':
          store.dispatch(setSystemState(payload.result));
          break;
        default:
          break;
      }
    } catch (err) {
      remoteChannel.close();
    }
  }
}

export default sharedSaga;
