import React from "react"
import propublica from "../api/propublica"

class App extends React.Component {
  apiSearch = async () => {
    const response = await propublica.get("/114/senate/sessions/1/votes/3.json")
    console.log(response)
  }

  render() {
    this.apiSearch()
    return (
      <div>App</div>
    )
  }
}


export default App