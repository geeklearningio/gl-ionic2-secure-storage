import {NgModule, ModuleWithProviders} from "@angular/core";
import {GLSecureStorageProvider} from "./providers/gl-secure-storage-provider";
import {GLSecureStorageConfigProvider} from "./providers/gl-secure-storage-config-provider";
import {CryphoSecureStorageProvider} from "./providers/platform-storages/crypho-secure-storage-provider";
import {IntelSecureStorageProvider} from "./providers/platform-storages/intel-secure-storage-provider";
import {StorageProvider} from "./providers/platform-storages/storage-provider";
import {SecureStorage} from "@ionic-native/secure-storage";
import {IonicStorageModule} from "@ionic/storage";
import {Device} from "@ionic-native/device";

@NgModule({
    declarations: [],
    exports: [],
    imports: [
        IonicStorageModule.forRoot()
    ],
    providers: [CryphoSecureStorageProvider, IntelSecureStorageProvider, StorageProvider, SecureStorage, Device ]
})
export class GlIonic2SecureStorageModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GlIonic2SecureStorageModule,
      providers: [ GLSecureStorageProvider, GLSecureStorageConfigProvider ]
    };
  }
}
