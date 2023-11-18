const { json } = require("express");
const userService = require("../services/userService");
const s3 = require("../utils/aws-config");
const imageUpload = require("../middlewares/imageUpload");

// 유저 정보 불러오기
const userInfo = async(req, res) => {

    const userTokenDecode = req.user; // 디코드된 토큰 정보 불러오기

    try{
        if(!userTokenDecode){
            throw new Error("key_error");
        }

        const result = await userService.userInfo(userTokenDecode);
        return res.json({data : result})

    }catch(error){
        console.log(error);
        throw error;
    }
}

// //mypage 주문 취소
const orderCancel = async(req, res) => {

    const reservationInfo = req.body
    const userTokenDecode = req.user; // 디코드된 토큰 정보 불러오기

    try{
        if(!reservationInfo || !userTokenDecode){ // key 검증
            throw new Error("key_error");
        }

        const result = await userService.orderCancel(reservationInfo, userTokenDecode);

        if(result !== true){
            throw new Error("cancel_fail")
        }

        return res.json({message : "cancel_success"});

    }catch(error){

        if(error.message === "key_error"){ // request 값이 없을 경우
            return res.json({message : "key_error"});
        }

        if(error.message === "user_does_not_exist"){ // 유저정보가 일치하지 않을 경우
            return res.json({message : "user_does_not_exist"})
        }

        if(error.message === "reservationInfo_not_found"){ // 주문 정보가 없을 경우
            return res.json({message : "reservationInfo_not_found"})
        }
        
        if(error.message === "order_delete_error"){ // 주문 취소에 실패 했을 경우
            return res.json({message : "order_delete_error"})
        }

        if(error.message === "cancel_fail"){
            return res.json({message : "cancel_fail"}) // result 값이 true 가 아닐 경우
        }

        if(error.message === "user_credit_update_fail"){
            return res.json({message : "user_credit_update_fail"}) // 유저의 credit 값이 업데이트가 되지 않았을 경우
        }

        if(error.message === "seat_status_update_fail"){
            return res.json({message : "seat_status_update_fail"})
        }

    }
}

// //mypage 프로필 수정
const profileUpdate = async(req, res) =>{

    //여기서 토큰의 정보를 같이 받을거임
    const userName = req.body.name; // 유저 이름 받기
    const profileImage = req.file // 업로드 파일 받기
    const userTokenDecode = req.user; // 디코드된 토큰 정보 불러오기
    
    console.log(profileImage);


    try{
        if( !userName && !profileImage  && !userTokenDecode){
            throw new Error("key_error");
        }

        // AWS S3 이미지 업로드
        let uploadResult = "" 
        let imageUrl = ""

        if(profileImage) { // 프로필 이미지가 있을 경우
            uploadResult = await imageUpload.profileImageUpload(profileImage); //이미지 업로드
            imageUrl = uploadResult.Location; // 업로드된 이미지의 URL 받아옴
        }

        const result = await userService.profileUpdate(imageUrl, userTokenDecode, userName);
        return res.json({message : "update_success", message : result[0]});

    }catch(error){
        if(error.message === "key_error"){
           return res.json({message : "key_error"});
        }
        
        if(error.message === "user_not_found"){
            return res.json({message : "user_not_found"})
        }

        if(error.message === "userName_update_error"){
            return res.json({message : "userName_update_error"})
        }

        if(error.message === "userProfile_userName_update_error"){
            return res.json({message : "userProfile_userName_update_error"})
        }
    }
}

module.exports = {
    userInfo,
    orderCancel,
    profileUpdate
}