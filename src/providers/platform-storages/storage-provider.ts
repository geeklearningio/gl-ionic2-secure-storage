import {Injectable} from "@angular/core";
import {Events} from "ionic-angular";
import {Storage} from "@ionic/storage";
import {GLSecureStorageProvider} from "../gl-secure-storage-provider";

@Injectable()
export class StorageProvider {

  private clearStatus = {
    total: 0,
    current: 0
  };

  constructor(private events: Events,
              private storage: Storage) {

  }

  get(key: string): Promise<string> {
    return this.storage.get(key);
  }

  set(key: string, value: string): Promise<any> {
    return this.storage.set(key, value);
  }

  remove(key: string): Promise<string> {
    return this.storage.remove(key);
  }

  clear(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.keys()
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
      this.storage.remove(key)
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
