import React from "react"
import propublica from "../api/propublica"

class App extends React.Component {
  state = { description: [] }

  apiSearch = async () => {
    const response = await propublica.get("/114/senate/sessions/1/votes/50.json")
    console.log(response.data.results.votes.vote.description)
    this.setState({description: response.data.results.votes.vote.description})
  }

  render() {
    return (
      <div>
        <button onClick={this.apiSearch}>Search</button>
        <div>{this.state.description}</div>
      </div>
      
    )
  }
}


export default App