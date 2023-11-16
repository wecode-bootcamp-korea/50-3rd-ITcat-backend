const userDao = require("../models/userDao")


//mypage 주문 취소
const orderCancel = async (reservationId, totalAmount, userTokenDecode) => {
    try{
        //토큰의 유저 ID, Email 가져오기
        const userId = userTokenDecode.id;
        const userEmail = userTokenDecode.email;

        // 유저 데이터 크레딧 및 유저 정보 조회
        const selectUserInfo = await userDao.selectUserInfo(userId) // 토큰의 userId로 유저의 크레딧 조회
        const dbUserId = selectUserInfo[0].id; // db에 저장된 유저 id 정보
        const dbuserEmail = selectUserInfo[0].email; // db에 저장된 유저 email 정보

        if(userId !== dbUserId || userEmail !== dbuserEmail ){ // 토큰의 유저 id, email과 db에 유저 id와 email 비교 검증
            throw new Error("user_does_not_exist")
        }
  
        if(selecUserInfo.length === 0){ // db에서 유저가 조회되지 않았을 경우
            throw new Error("order_delete_error");
        }

        const userCredit = selectUserCredit[0].credit; // 유저 크레딧 정보 담기
        const userTotalCredit = totalAmount + userCredit; // 결제한 크레딧 + 유저의 기존 크레딧
    
        // 결제 취소 분 크레딧 업데이트
        const updateUserCredit = await userDao.updateUserCredit(userTotalCredit, userId);

        if(updateUserCredit.affectedRows === 0){
            console.log("유저 크레딧 업데이트 에러");
            throw new Error("order_delete_error")
        }
        
        // 주문 데이터 업데이트 -> 데이터 삭제가 아닌 status 값을 cancel로 변경
        const updateOrderStatus = await userDao.updateOrderStatus(reservationId, userId);

        if(updateOrderStatus.affectedRows === 0){
            console.log("유저 주문정보 삭제 에러");
            throw new Error("order_delete_error")
        }

        return true; // cancel 처리가 완료되면 true 리턴

    }catch(error){
        throw error
    }
}

//mypage 프로필 수정
const profileUpdate = async (imageUrl, userTokenDecode) => {
    try{
        //유저정보
        const userId = userTokenDecode.id;
        const userEmail = userTokenDecode.email;
        
        // 유저 데이터 크레딧 및 유저 정보 조회
        const selectUserInfo = await userDao.selectUserInfo(userId) // 토큰의 userId로 유저의 크레딧 조회
        const dbUserId = selectUserInfo[0].id; // db에 저장된 유저 id 정보
        const dbuserEmail = selectUserInfo[0].email; // db에 저장된 유저 email 정보

        if(userId !== dbUserId || userEmail !== dbuserEmail ){ // 토큰의 유저 id, email과 db에 유저 id와 email 비교 검증
            throw new Error("user_not_found")
        }

        const result = await userDao.profileUpdate(imageUrl, userId); // 유저 id를 통해 user의 이미지 업로드

        if(result.affectedRows === 0){ // 업로드 실패시
            throw new Error("profile_update_error")
        }

        // 업데이트 된 유저의 새로운 프로필 이미지 반환하기
        const newUserProfileImage = await userDao.newUserProfileImage(userId);
        console.log(newUserProfileImage);

        if(newUserProfileImage.length === 0){
            throw new Error("user_not_found");
        }

        return newUserProfileImage; // 업데이트 된 유저의 새로운 프로필 이미지 반환하기

    }catch(error){
        throw error
    }
}

module.exports = {
    orderCancel,
    profileUpdate
}