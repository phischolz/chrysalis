import GetRequestSender from "./requestSenders/GetRequestSender";
import PostRequestSender from "./requestSenders/PostRequestSender";
import DeleteRequestSender from "./requestSenders/DeleteRequestSender";
import {hot} from "react-hot-loader";
import PatchRequestSender from "./requestSenders/PatchRequestSender";

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

export default hot(module)(SenderRepository)