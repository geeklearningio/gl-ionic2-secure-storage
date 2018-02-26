import {NgModule, ModuleWithProviders} from "@angular/core";
import {GLSecureStorageProvider} from "./providers/gl-secure-storage-provider";
import {GLSecureStorageConfigProvider} from "./providers/gl-secure-storage-config-provider";

@NgModule({
    declarations: [
    ],
    exports: [
    ]
})
export class GlIonic2SecureStorageModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GlIonic2SecureStorageModule,
      providers: [ GLSecureStorageProvider, GLSecureStorageConfigProvider ]
    };
  }
}

