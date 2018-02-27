import {NgModule, ModuleWithProviders} from "@angular/core";
import {GLSecureStorageProvider} from "./providers/gl-secure-storage-provider";
import {GLSecureStorageConfigProvider} from "./providers/gl-secure-storage-config-provider";
import {CryphoSecureStorageProvider} from "./providers/platform-storages/crypho-secure-storage-provider";
import {IntelSecureStorageProvider} from "./providers/platform-storages/intel-secure-storage-provider";

@NgModule({
    declarations: [],
    exports: []
})
export class GlIonic2SecureStorageModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GlIonic2SecureStorageModule,
      providers: [ GLSecureStorageProvider, GLSecureStorageConfigProvider, CryphoSecureStorageProvider, IntelSecureStorageProvider ]
    };
  }
}

