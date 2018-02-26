import {Injectable} from '@angular/core';
import {Platform} from "ionic-angular";
import {Device} from "@ionic-native/device";
import {
    CryphoSecureStorageObject,
    CryphoSecureStorageProvider
} from "./platform-storages/crypho-secure-storage-provider";
import {
    IntelSecureStorageObject,
    IntelSecureStorageProvider
} from "./platform-storages/intel-secure-storage-provider";
import {StorageProvider} from "./platform-storages/storage-provider";
import {GLSecureStorageConfigProvider} from "./gl-secure-storage-config-provider";

export interface ISecureStorageObject  {
  get(key: string): Promise<string>;
  set(key: string, value: string): Promise<any>;
  remove(key: string): Promise<string>;
  clear(): Promise<any>;
}

@Injectable()
export class GLSecureStorageProvider {
  private namespace: string;

  public static clearStorageStatusUpdateEvent: string = "event.broadcast.app.GLSecureStorage.clearStorageStatusUpdateEvent";

  private secureStorageObject: ISecureStorageObject;

  constructor(private glSecureStorageConfig: GLSecureStorageConfigProvider,
              private cryphoSecureStorage: CryphoSecureStorageProvider,
              private intelSecureStorage: IntelSecureStorageProvider,
              private glStorage: StorageProvider,
              private platform: Platform,
              private device: Device) {
    this.securityApiReady();
  }

  private securityApiReady(): Promise<void> {
    let promise = new Promise<void>((resolve, reject) => {
      this.platform.ready()
        .then((readySource: string) => {
          if (this.secureStorageObject) {
            return resolve();
          }
          let deviceModel = this.device.model; // check if it's an emulator because the secure storage crashes on emulator.
          if (readySource === 'cordova' && deviceModel !== 'x86_64') {
            this.namespace = this.glSecureStorageConfig.getNamespace();

            if (this.platform.is('ios')) {
              this.cryphoSecureStorage.create(this.namespace)
                .then((cryphoSecureStorageObject: CryphoSecureStorageObject) => {
                  this.secureStorageObject = cryphoSecureStorageObject;
                  return resolve();
                });
            } else if (this.platform.is('android')) {
              this.intelSecureStorage.create()
                .then((secureStorageObject: IntelSecureStorageObject) => {
                  this.secureStorageObject = secureStorageObject;
                  return resolve();
                });
            }
          } else {
            this.secureStorageObject = this.glStorage;
            console.warn('There is no secure Storage on desktop or emulator, falling back on standard storage');
            return resolve();
          }
        });
    });
    return promise;
  }

  public set(key: string, value: string): Promise<any> {
    return this.securityApiReady()
      .then(() => this.secureStorageObject.set(key,value));
  }

  public get(key: string): Promise<string> {
    return this.securityApiReady()
      .then(() => this.secureStorageObject.get(key));
  }

  public remove(key: string): Promise<string> {
    return this.securityApiReady()
      .then(() => this.secureStorageObject.remove(key));
  }

  public clear(): Promise<string> {
    return this.securityApiReady()
      .then(() => this.secureStorageObject.clear());
  }

}
