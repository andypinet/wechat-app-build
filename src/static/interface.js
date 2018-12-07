function UserInfo() {
  return {
    avatarUrl: '',
    city: '',
    country: '',
    gender: '',
    language: '',
    nickName: '',
    province: '',
  }
}

function UserInfoDetail() {
  return {
    encryptedData: '',
    errMsg: '',
    iv: '',
    rawData: JSON.stringify(''),
    signature: '',
    userInfo: UserInfo()
  }
}

module.exports = {
  UserInfo,
  UserInfoDetail
}
