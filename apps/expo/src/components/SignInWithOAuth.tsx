import { useSignUp, useSignIn } from "@clerk/clerk-expo";
import React, { useState } from "react";
import { Button, View, TextInput, Text } from "react-native";

import * as AuthSession from "expo-auth-session";

enum STEP {
  SIGN_IN = "SIGN_IN",
  VERIFY = "VERIFY",
}

const SignInWithOAuth = () => {
  const { isLoaded, signIn, setSession } = useSignIn();
  const { signUp } = useSignUp();

  const [verifyType, setVerifyType] = useState<"sign-up" | "sign-in">(
    "sign-up",
  );

  const [step, setStep] = useState(STEP.SIGN_IN);

  const [email, setEmail] = useState("");

  if (!isLoaded) return null;

  return (
    <>
      {step === STEP.SIGN_IN && (
        <SignInForm
          email={email}
          setEmail={setEmail}
          setStep={setStep}
          setVerifyType={setVerifyType}
        />
      )}
      {step === STEP.VERIFY && <VerifySignUpForm verifyType={verifyType} />}
    </>
  );
};

const VerifySignUpForm = ({
  verifyType,
}: {
  verifyType: "sign-up" | "sign-in";
}) => {
  const { isLoaded: isSignInLoaded, setSession, signIn } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
  const [code, setCode] = useState("");

  if (!isSignInLoaded || !isSignUpLoaded) return null;

  return (
    <>
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="123456"
        className="rounded-lg border-2 border-gray-500 p-4"
      />
      <Button
        title="Verify sign up"
        // className="rounded-lg border-2 border-gray-500 p-4"
        onPress={async () => {
          try {
            if (verifyType === "sign-up") {
              const res = await signUp.attemptEmailAddressVerification({
                code,
              });
              await setSession(res.createdSessionId);
            } else {
              const res = await signIn.attemptFirstFactor({
                strategy: "email_code",
                code,
              });
              await setSession(res.createdSessionId);
            }
          } catch (error) {
            console.log(error);
          }
        }}
      />
    </>
  );
};

const SignInForm = ({
  email,
  setEmail,
  setStep,
  setVerifyType,
}: {
  email: string;
  setEmail: (email: string) => void;
  setStep: (step: STEP) => void;
  setVerifyType: (type: "sign-up" | "sign-in") => void;
}) => {
  const { isLoaded: isSignInLoaded, setSession, signIn } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();

  if (!isSignInLoaded || !isSignUpLoaded) return null;

  const onSignIn = async () => {
    try {
      const { supportedFirstFactors } = await signIn.create({
        identifier: email,
      });

      console.log(supportedFirstFactors);

      const firstEmailFactor = supportedFirstFactors.find((factor) => {
        return factor.strategy === "email_code";
      })!;

      const { emailAddressId } = firstEmailFactor as any;

      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId,
      });
      setVerifyType("sign-in");
    } catch (error: any) {
      const errorCode = error.errors[0].code;
      // User does not exist, create a new user
      if (errorCode === "form_identifier_not_found") {
        await signUp.create({ emailAddress: email });
        await signUp.prepareEmailAddressVerification();
        setVerifyType("sign-up");
      }
      console.log(error.errors);
    } finally {
      setStep(STEP.VERIFY);
    }
  };

  return (
    <>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="example@email.com"
        className="rounded-lg border-2 border-gray-500 p-4"
      />
      <Button
        title="Sign in with email"
        // className="rounded-lg border-2 border-gray-500 p-4"
        onPress={onSignIn}
      />
    </>
  );
};

export default SignInWithOAuth;
