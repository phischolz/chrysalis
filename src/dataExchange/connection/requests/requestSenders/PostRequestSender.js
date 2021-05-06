class PostRequestSender {
    /**
     * Posting data to the database
     * @param url - request address
     * @param data - entities to post
     * @returns {Promise<Response>} - asynchronous response, containing error if present
     */
    send = (url, data) => {
        return fetch(url, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        }).then(res => {
            if (!res.ok) {
                throw new Error("Couldn't post the data to the database")
            }
        }).catch(err => {
            return err.message
        })
    }
}

export default PostRequestSender