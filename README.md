# Concordia Campus Navigation

This project is the result of SOEN 390 course. 
This is a mobile application that provides Concordia campus navigation with in-building navigation to classrooms and indication of points of interest (indoor and outdoor)


## Troubleshooting
For all problems DM Cristina. Chance is she had the same problem as you and knows how to fix it. She struggled enough with this set up so that you don't have to :)

## Repo Instalation Instructions

> Please make sure to install Node.js v14 or higher. You can verify this using
> ```
> node --version
> ```
> ```
> npm --version
> ```


1. Install Android Studio [here](https://developer.android.com/studio?gad_source=1&gclid=CjwKCAiAneK8BhAVEiwAoy2HYT1FqHBDPSs8u9BNvyGGFMF0M5GmROtabxzmUS7WtYK3wT5LJ2Y6XhoCmXIQAvD_BwE&gclsrc=aw.ds)
2. Set up ANDROID_HOME variable in your env. variables and point it to where the SDK was installed. <br>
To find the path go in Android Studio go to Settings > Language & Framework > Android SDK. <br>
For Windows users, by default it can be found in
```
%LOCALAPPDATA%\Android\Sdk
```
3. To your Path user variable add
```
%ANDROID_HOME%\platform-tools
```
4. Open app in your preferred IDE (most use VS Code)
5. In the app root run
```
npm install
```
6. Navigate to backend directory with
```
cd backend
```
7. Run
```
npm install
```
8. To run the application navigate to the root and run
```
npx expo start
```
9. Then in a new terminal navigate to `/backend` and run
```
node server.js
```
10. In Android studio go to Device Manager on the right sidebar and start up a device. It will start the emulator
11. In the frontend terminal write `a`. This should strat the installation of the Expo app on the emulator and you will be able to visualize the app
12. Detox testing should be set up with the pipelines but if it's not yet ready, follow these steps
13. Make sure that the `/android` path is present in the root of the project. If not, run
```
npx expo prebuild
```
14. Now run the following commands. The first one may take up to 15 min $${\color{red}This \space dosen't \space work \space yet}$$
```
detox build --configuration android.emu.debug
```
detox test --configuration android.emu.debug
```

