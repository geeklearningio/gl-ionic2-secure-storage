import {NgModule, ModuleWithProviders} from "@angular/core";
import {GLSecureStorageProvider} from "./providers/gl-secure-storage-provider";
import {GLSecureStorageConfigProvider} from "./providers/gl-secure-storage-config-provider";
import {CryphoSecureStorageProvider} from "./providers/platform-storages/crypho-secure-storage-provider";
import {IntelSecureStorageProvider} from "./providers/platform-storages/intel-secure-storage-provider";
import {StorageProvider} from "./providers/platform-storages/storage-provider";
import {SecureStorage} from "@ionic-native/secure-storage";

@NgModule({
    declarations: [],
    exports: [],
    providers: [CryphoSecureStorageProvider, IntelSecureStorageProvider, StorageProvider, SecureStorage ]
})
export class GlIonic2SecureStorageModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GlIonic2SecureStorageModule,
      providers: [ GLSecureStorageProvider, GLSecureStorageConfigProvider ]
    };
  }
}

