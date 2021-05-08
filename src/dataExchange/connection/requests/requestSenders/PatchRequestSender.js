class PatchRequestSender {
    /**
     * Sends a PATCH request to the database
     * @param url - request address
     * @param data - fields to be corrected and/or added
     * @returns {Promise<Response>} - asynchronous response, containing error if present
     */
    send = (url, data) => {
        return fetch(url, {
            method: 'PATCH',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        }).then(res => {
            if (!res.ok) {
                throw Error("Could not correct the data in the database")
            }
        }).catch(error => {
            return error.message
        })
    }
}

export default PatchRequestSender