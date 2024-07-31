  export const jwtConstants = {
    get secret() {
      return process.env.JWT_SECRET_KEY;
    },
    get expirationTime() {
      return process.env.JWT_EXPIRATION_TIME;
    },
  };
  
  //DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.