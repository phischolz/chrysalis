const GetRequestSender = require( "./requestSenders/GetRequestSender");
const PostRequestSender = require( "./requestSenders/PostRequestSender");
const DeleteRequestSender = require( "./requestSenders/DeleteRequestSender");
const {hot} = require( "react-hot-loader");
const PatchRequestSender = require( "./requestSenders/PatchRequestSender");

class SenderRepository {
    /**
     * Returning sender object for specified request method
     * @param methodName - request method
     * @returns RequestSender - desired sender object
     */
    static getSender = (methodName) => {
        const connectParamsMap = new Map([
            ['GET', new GetRequestSender()],
            ['POST', new PostRequestSender()],
            ['DELETE', new DeleteRequestSender()],
            ['PATCH', new PatchRequestSender()]
        ])

        return connectParamsMap.get(methodName);
    }
}

module.exports = hot(module)(SenderRepository)