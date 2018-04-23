import {Injectable} from "@angular/core";
import {Events, Platform} from "ionic-angular";
import {SecureStorage, SecureStorageObject} from "@ionic-native/secure-storage";
import {GLSecureStorageProvider} from "../gl-secure-storage-provider";

class Deferred<T> {

  promise: Promise<T>;
  resolve: (value?: T | PromiseLike<T>) => void;
  reject:  (reason?: any) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject  = reject;
    });
  }
}


@Injectable()
export class CryphoSecureStorageProvider {
  private secureStorageObject: CryphoSecureStorageObject;

  constructor(private platform: Platform,
              private events: Events,
              private secureStorage: SecureStorage) {

  }

  create(store: string): Promise<CryphoSecureStorageObject> {
    return new Promise((resolve, reject) => {
      this.platform.ready()
        .then(() => {
          if (!this.secureStorageObject) {
            this.createIonicStorageObject(store)
              .then((ionicSecureStorageObject: SecureStorageObject) => {
                this.secureStorageObject = new CryphoSecureStorageObject(ionicSecureStorageObject, this.events);
                return resolve(this.secureStorageObject);
              }, (error) => {
                return reject(error);
              });
          } else {
            return resolve(this.secureStorageObject);
          }
        });
    });
  }

  private createIonicStorageObject(store: string): Promise<SecureStorageObject> {
    return new Promise((resolve, reject) => {
      this.secureStorage.create(store)
        .then((ionicSecureStorageObject: SecureStorageObject) => {
          resolve(ionicSecureStorageObject);
        }, (error) => {
          return reject(error);
        });
    });
  }
}

export class CryphoSecureStorageObject {

  private clearStatus = {
    total: 0,
    current: 0
  };


  constructor(private ionicSecureStorageObject: SecureStorageObject,
              private events: Events) {
  }

  get(key: string): Promise<string> {
    let deferred = new Deferred<string>();
    this.ionicSecureStorageObject.get(key)
      .then((value)=>{
          deferred.resolve(value);
        },
        (error)=>{
          deferred.resolve(null);
        });
    return deferred.promise;

  }

  set(key: string, value: string): Promise<any> {
    return this.ionicSecureStorageObject.set(key, value);
  }

  remove(key: string): Promise<string> {
    return this.ionicSecureStorageObject.remove(key);
  }

  clear(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.ionicSecureStorageObject.keys()
        .then((keys: Array<string>) => {
          this.clearStatus.total = keys.length;
          this.clearStatus.current = 0;
          if (keys.length === 0) {
            return resolve();
          }
          let removePromises = keys.map(key => this.removeAndBumpClearStatus(key));
          Promise.all(removePromises)
            .then(() => {
              return resolve();
            }, (error) => {
              return reject(error);
            });
        }, (error) => {
          return reject(error);
        });
    });
  }

  private removeAndBumpClearStatus(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.ionicSecureStorageObject.remove(key)
        .then((result: string) => {
          this.clearStatus.current += 1;
          this.events.publish(GLSecureStorageProvider.clearStorageStatusUpdateEvent, this.clearStatus.current / this.clearStatus.total * 100);
          return resolve(result);
        }, (error) => {
          return reject(error);
        });
    });
  }

}
