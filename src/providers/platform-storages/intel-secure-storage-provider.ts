import {Injectable} from '@angular/core';
import {Events, Platform} from "ionic-angular";
import {GLSecureStorageProvider} from "../gl-secure-storage-provider";

@Injectable()
export class IntelSecureStorageProvider {
  private secureStorageObject: IntelSecureStorageObject;

  constructor(private platform: Platform,
              private events: Events) {

  }

  create() {
    return new Promise((resolve, reject) => {
      this.platform.ready()
        .then(() => {
          if (!(<any>window).intel || !(<any>window).intel.security) {
            return reject('Intel Secure Storage Plugin must be installed to work on Android');
          }
          if (!this.secureStorageObject) {
            this.secureStorageObject = new IntelSecureStorageObject(this.events);
          }
          resolve(this.secureStorageObject);
        });
    });
  }
}

export class IntelSecureStorageObject {
  private secureApi;
  private keys: Array<string>;
  private keysArrayStorageKey: string = 'GLISK';

  private clearStatus = {
    total: 0,
    current: 0
  };

  constructor(private events: Events) {
    this.secureApi = (<any>window).intel.security;
  }

  set(key: string, value: string) {
    return new Promise((resolve, reject) => {
      this.secureApi.secureData.createFromData({data: value})
        .then((dataInstanceID: string) => {
          return this.secureApi.secureStorage.write({id: key, instanceID: dataInstanceID});
        })
        .then(() => {
          this.addKeyToStorage(key)
            .then(() => {
              return resolve();
            });
        })
        .catch((error: any) => {
          console.error("Error encrypting file data, error code is: " + error.code + ", error message is: " + error.message);
          return reject(error);
        });
    });
  }

  get(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.secureApi.secureStorage.read({id: key})
        .then(this.secureApi.secureData.getData)
        .then((data: string) => {
          return resolve(data);
        })
        .catch((error: any) => {
          // if the key does not exist, we get a file system error. Just don't log anything
          if (error.code !== 1) {
            console.error("Error getting encrypted file data, error code is: " + error.code + ", error message is: " + error.message);
            return reject(error);
          } else {
            return resolve(null);
          }
        });
    });
  }

  remove(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.secureApi.secureStorage.delete({id: key})
        .then(() => {
          this.removeKeyFromStorage(key)
            .then(() => {
              return resolve(key);
            });
        })
        .catch((error: any) => {
          // if the key does not exist, we get a file system error. Just don't log anything
          if (error.code !== 1) {
            console.error("Error getting encrypted file data, error code is: " + error.code + ", error message is: " + error.message);
            return reject(error);
          } else {
            return resolve(key);
          }
        });
    });
  }

  clear(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getKeysFromStorage()
        .then((keys: Array<string>) => {
          this.clearStatus.total = keys.length;
          this.clearStatus.current = 0;
          if (keys.length === 0) {
            return resolve();
          }
          let removePromises = keys.map(key => this.removeStorageKeysArray(key, true));
          Promise.all(removePromises)
            .then(() => {
              this.clearKeysFromStorage()
                .then(() => {
                  return resolve();
                });
            }, (error) => {
              return reject(error);
            });
        });
    });
  }

  private getKeysFromStorage() {
    return new Promise<Array<string>>((resolve) => {
      if (this.keys) {
        return resolve(this.keys);
      }
      this.get(this.keysArrayStorageKey)
        .then((keys: string) => {
          if (keys) {
            return resolve(JSON.parse(keys));
          } else {
            return resolve([]);
          }
        });
    });
  }

  private addKeyToStorage(key: string): Promise<any> {
    return new Promise((resolve) => {
      this.getKeysFromStorage()
        .then((keys: Array<string>) => {
          this.keys = keys;
          if (this.keys.findIndex(arrayKey => key === arrayKey) === -1) {
            this.keys.push(key);
            this.setStorageKeysArray(this.keysArrayStorageKey, JSON.stringify(this.keys))
              .then(() => {
                return resolve();
              });
          } else {
            return resolve();
          }
        });
    });
  }

  private removeKeyFromStorage(key: string): Promise<any> {
    return new Promise((resolve) => {
      this.getKeysFromStorage()
        .then((keys: Array<string>) => {
          this.keys = keys;
          let index = this.keys.indexOf(key);
          if (index > -1) {
            this.keys.splice(index, 1);
            this.setStorageKeysArray(this.keysArrayStorageKey, JSON.stringify(this.keys))
              .then(() => {
                return resolve();
              });
          }
        });
    });
  }

  private clearKeysFromStorage(): Promise<any> {
    return new Promise((resolve) => {
      this.removeStorageKeysArray(this.keysArrayStorageKey)
        .then(() => {
          this.keys = [];
          return resolve();
        });
    });
  }

  private setStorageKeysArray(key: string, value: string) {
    return new Promise((resolve, reject) => {
      this.secureApi.secureData.createFromData({data: value})
        .then((dataInstanceID: string) => {
          return this.secureApi.secureStorage.write({id: key, instanceID: dataInstanceID});
        })
        .then(() => {
          return resolve();
        })
        .catch((error: any) => {
          console.error("Error encrypting file data, error code is: " + error.code + ", error message is: " + error.message);
          return reject(error);
        });
    });
  }

  private removeStorageKeysArray(key: string, bumpStatus: boolean = false): Promise<any> {
    return new Promise((resolve, reject) => {
      this.secureApi.secureStorage.delete({id: key})
        .then(() => {
          if (bumpStatus) {
            this.bumpClearStatus();
          }
          return resolve();
        })
        .catch((error: any) => {
          // if the key does not exist, we get a file system error. Just don't log anything
          if (error.code !== 1) {
            console.error("Error getting encrypted file data, error code is: " + error.code + ", error message is: " + error.message);
            return reject(error);
          } else {
            if (bumpStatus) {
              this.bumpClearStatus();
            }
            return resolve(key);
          }
        });
    });
  }

  private bumpClearStatus() {
    this.clearStatus.current += 1;
    this.events.publish(GLSecureStorageProvider.clearStorageStatusUpdateEvent, this.clearStatus.current / this.clearStatus.total * 100);
  }

}
