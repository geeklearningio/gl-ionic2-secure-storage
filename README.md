# Why this bundle?

Ionic has already a Secure Storage Provider, so why did we do this bundle? 

Here is the Ionic doc for Secure Storage: https://ionicframework.com/docs/native/secure-storage/.

### A generic storage
You don't need to know on which platform you are to store your data. The GLSecureStorage is the only provider you'll need. It fallbacks on the Ionic Storage (not encrypted) when on browser.

Note: A good idea would be to implement a browser version of the secure storage using the Web Crypto API. PR are welcome!

Note: Another good idea would be to do a Windows version.

## A better Android plugin
The Android version of the Secure Storage needs a secure screen-lock on the device to work properly: https://github.com/Crypho/cordova-plugin-secure-storage#users-must-have-a-secure-screen-lock-set. And also, the storage is cleared when the user changes his security settings in his phone. It's not really great for a user experience.
So for Android, this bundle will instead use the Intel security plugin, which does not have all these downsides.

### Works with big data
We encountered some problems whith the Secure Storage on iOS with big data stored in it. The clear method crashes when there is too much data to remove. So we made another clear method to work around this bug.
The provider also sends events when clearing to notify the app of the progression percentage, as it can take some time to delete all the data.

Note : We don't use the Intel security plugin for iOS, as it does not work on iOS 9 and up: https://github.com/AppSecurityApi/com-intel-security-cordova-plugin/issues/9

# Install

## The bundle
Install this bundle using npm:
```
npm install gl-ionic2-secure-storage
```

## The Cordova plugins
Install the 2 needed cordova plugins using cordova:
```
ionic cordova plugin add com-intel-security-cordova-plugin cordova-plugin-secure-storage
```

# Usage

## Create a config class for the GLSecureStorageProvider
The `GLSecureStorageProvider` is configured via a configuration file named `GLSecureStorageConfigProvider`. You need to copy it from the source, give it another name and implement it's functions as described in the comments.
File: https://github.com/geeklearningio/gl-ionic2-secure-storage/blob/master/src/providers/gl-secure-storage-config-provider.ts

```typescript
import {Injectable} from '@angular/core';

@Injectable()
export class MySecureStorageConfigProvider {

  constructor() {
  }

  // override this function to set a namespace
  public getNamespace(): string {
    return 'mynamespace';
  }
}
```
The namespace is used by the Intel plugin for Android to create a specific folder in the storage for your app.


## Import the module and decalre the providers
Add the module to your `app.module.ts`, declare the `GLSecureStorageProvider` and override the `GLSecureStorageConfigProvider` with your own.

```typescript
import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

// Import the module and the providers / components you want to use
import { IonicTools2Module, ConnectivityProvider } from '@bpce/ionic-tools-2/dist/src';

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    IonicModule.forRoot(MyApp),

    GlIonic2SecureStorageModule.forRoot() // Put the module here
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    GLSecureStorageProvider, // Put the providers here
    {provide: GLSecureStorageConfigProvider, useClass: MyGLSecureStorageConfigProvider } // override the GLSecureStorageConfigProvider
  ]
})
export class AppModule {}
```
## Use the provider
It works like any storage provider:
```typescript
import {Injectable} from '@angular/core';
import {GLSecureStorageProvider} from "gl-ionic2-secure-storage/dist/src";

@Injectable()
export class MyPage {

  constructor(glSecureStorage: GLSecureStorageProvider) {
    this.glSecureStorage.set('myKey', 'toto');
  }
}
```

Available functions:
- Set
- Get
- Remove
- Clear
