class User{
  constructor(userId, firstName, lastName, email, password){
    this._userId = userId;
    this._firstName = firstName;
    this._lastName = lastName;
    this._emailAddress = email;
    this._password = password
  }

  getUserID(){
    return this._userID;
  }

  setUserID(value){
    this._userID = value;
  }

  getFirstName(){
    return this._firstName;
  }

  setFirstName(value){
    this._firstName = value;
  }

  getLastName(){
    return this._lastName;
  }

  setLastName(value){
    this.lastName = value;
  }

  getEmail(){
    return this._emailAddress;
  }

  setEmail(value){
    this._emailAddress = value;
  }
  getPassword(){
    return this._password;
  }
  setPassword(value){
    this._password =value;
  }
}
module.exports = User;
