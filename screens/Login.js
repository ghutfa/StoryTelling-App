import React, { Component } from "react";
import { StyleSheet, View, Button } from "react-native";
import * as Google from "expo-google-app-auth";
import firebase from "firebase"

export default class LoginScreen extends Component{
    isUserEqual = (googleUser, firebaseUser) => {
        if (firebaseUser) {
            var providerData = firebaseUser.providerData
            for (var i=0; i < providerData.length; i++){
                if (
                    providerData[i].providerId ===
                    firebase.auth.GoogleAuthProvider.PROVIDER.ID &&
                    providerData[i].uid === googleUser.getBasicProfile().getId()
                ) {
                    return true;
                }
            } 
        }
        return false;
    }

 onSignIn = googleUser => {
    var unsubscribe = firebase.auth().onAuthStateChanged(firebaseUser => {
        unsubscribe();
        if(!this.isUserEqual (googleUser, firebaseUser)) {
            var credentials = firebase.auth.GoogleAuthProvider.credential(
                googleUser.idToken,
                googleUser.accessToken
            );
            

            firebase
            .auth()
            .signInWithCredential(credential)
            .then(function(result) {
                if (result.additionalUserInfo.isNewUser) {
                    firebase
                    .database()
                    .ref("/users/" + result.user.uid)
                    .set({
                        gmail: result.user.email,
                        profile_picture: result.additionalUserInfo.profile.picture,
                        locale: result.additionalUserInfo.profile.locale,
                        first_name: result.additionalUserInfo.proile.given_name,
                        last_name: result.additionalUserInfo.profile.family_name,
                        current_theme: "dark"
                    })
                    .then(function(snapshot) {});
                }
          })
          .catch(error=> {
            //Handle errors here
            var errorCode = error.code
            var errorMessage = error.message
            //The email of the user's account used
            var email = error.email
            //The firebase.auth.AuthCredentials type that was used
            var credential = error.credential
            // ...
          });
        } else {
            console.log("User already signed-in Firebase")
        }
    })
 }


   signInWithGoogle = async () => {
    try {
        const result = await Google.logInAsync({
            behaviour: "web",
            androidClientId:
            "358255388693-du6sj2tbekb76plv9i2tlibfqdribae3.apps.googleusercontent.com",
            iosClientId:
            "358255388693-7tc8rragn48aourmtvv0pd5jvrpbdtou.apps.googleusercontent.com",
            scopes: ["profile,email"]
        });

      if(result.type === "success") {
        this.onSignIn(result);
        return result.accessToken;
      } else {
        return {cancelled: true}
      }
    } catch (e) {
        console.log(e.message);
        return {error:true}
    }
  }

  render() {
    return(
        <View style={StyleSheet.container}>
            <Button 
              title = "Sign in with Google"
              onPress={() => this.signInWithGoogle}
            ></Button>
        </View>
    )
  }
}


const styles = StyleSheet.create({
    container: {
        fles:1,
        justifyContent:"center",
        alignItems: "center"
    }
});

