const {configDotenv}=require('dotenv')

configDotenv();
const mail_url=`${process.env.MAIL_SERVER}/send`;
const sendSignupLinkMail=async(email,role,tempId,validTo)=>{
    const mailSender={
        to:email,
        subject:`Congratualtion! you are shortlisted for ${role}`,
        htmlBody:`Your sign up link: http://localhost:3000/add-newcandidate/${tempId}  valid upto ${validTo}`,
        attachments:[]
    }
    const reqOption={
        method:"POST",
        headers:{
            "Content-type":"application/json"
        },
        body:JSON.stringify(mailSender)
    }
    console.log(mail_url);
    console.log(reqOption);
    return await fetch(mail_url,reqOption);
}


module.exports={sendSignupLinkMail}