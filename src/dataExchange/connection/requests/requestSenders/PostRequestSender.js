class PostRequestSender {
    /**
     Posting data to the database
     * @param url - request address
     * @param data - entities to post
     * @returns {Promise<{data: *, error: null} | {data: null, error: *}>} - asynchronous response, containing posted data or error if present
     */
    send = (url, data) => {
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'}
        }).then(res => {
            if (!res.ok) {
                throw new Error("Couldn't post the data to the database")
            }
            return res.json()
        }).then(data => {
            return {data: data, error: null}
        }).catch(err => {
            return {data: null, error: err.message}
        })
    }
}

export default PostRequestSender