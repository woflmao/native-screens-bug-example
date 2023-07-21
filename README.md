## Starting the app

### First time

Clone the app

run

`npm install`

run

`npx expo install`

`cd cattletraxx-mobile`

Follow [this](https://docs.expo.dev/develop/development-builds/installation/) guide to set
up eas, and login

After you have followed that guide and made an expo account and are logged in, 
run

`eas build --profile development --platform android`

or

`eas build --profile development-simulator --platform ios`

Wait for the build to complete (free tier can take up to 40 minutes for the queue to pop),
then scan the qr code on your device, follow the link, download the app, and install.

### Running the app

Open the app on your device, and on your computer, in your cattletraxx-mobile folder

run

`npx expo start --dev-client`

On your dev app on your device, scan the qr code, scan for servers, or enter the server address manually.

You should be connected after that, and any console logs will appear in your terminal on your computer. 

You can type 'r' into the running terminal window to reload any connected apps.

**THE APP WILL ONLY BE CONSIDERED CONNECTED IF IT IS OPEN ON YOUR DEVICE**