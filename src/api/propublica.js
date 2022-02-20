import axios from "axios"

//const KEY = "fyrqYQVFxVQIx0HKc84LV5tmeFqAgHwoPuf8k5o0"

export default axios.create({
  baseURL: "https://api.propublica.org/congress/v1",
  headers: {
    "X-API-Key": process.env.REACT_APP_API_KEY_PROPUBLICA
  }
})