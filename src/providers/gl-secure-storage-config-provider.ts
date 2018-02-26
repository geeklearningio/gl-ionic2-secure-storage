import {Injectable} from '@angular/core';

@Injectable()
export class GLSecureStorageConfigProvider {

  constructor() {
  }

  // override this function to set a namespace
  public getNamespace(): string {
    throw new Error('You must specify a namespace for the GLSecureStorageProvider. You must override the GLSecureStorageConfigProvider for that');
  }
}
