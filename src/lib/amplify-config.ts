import { Amplify } from 'aws-amplify';

export const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'ap-south-2_jMlybFAHH',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '1gjuuptp15rv97ogdhrqejmk2o',
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        email: true
      }
    }
  }
};

export function configureAmplify() {
  if (typeof window !== 'undefined') {
    Amplify.configure(cognitoConfig);
  }
}
