class DeleteRequestSender {
    /**
     * Deleting entity specified in url from db
     * @param url - address of request
     * @returns {Promise<Response>} - Asynchronous object, containing error if returned by the server
     */
    send = (url) => {
        return fetch(url, {
            method: 'DELETE'
        }).then(res => {
            if (!res.ok) {
                throw Error("Could not delete entity from the database")
            }
        }).catch(err => {
            return err.message
        })
    }
}

module.exports = DeleteRequestSender