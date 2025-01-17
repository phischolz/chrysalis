import SenderRepository from "./requests/SenderRepository";
import {hot} from "react-hot-loader";

class ExchangeHandler {
    /**
     * Sending request to the rest-server
     * @param method - request method
     * @param url - server address
     * @param data - for POST and PATCH requests - data sent to the server
     * @returns {Promise<Response>} - asynchronous response from the server
     */
    static sendRequest = (method, url, data) => {
        return SenderRepository.getSender(method).send(url, data)
    }
}

export default hot(module)(ExchangeHandler)