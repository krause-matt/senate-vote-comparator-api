import React, {useState, useEffect} from "react"
import propublica from "../api/propublica"

const App = () => {
  const [description, setDescription] = useState("")
  const [rollCall, setRollCall] = useState(null)

  useEffect(() => {
    if (rollCall) {
      const getVote = async () => {
        const response = await propublica.get(`/114/senate/sessions/1/votes/${rollCall}.json`)
        setDescription(response.data.results.votes.vote.description)
      }

      getVote()
    }

  },[rollCall])

  const voteNum = (e) => {
    console.log(e)
    setRollCall(e.target.value)
  }

  return (
    <div>
    <select className="ui search dropdown" onChange={voteNum}>
      <option value="">Choose Vote</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
      <option value="6">6</option>
    </select>
      <button onClick={() => useEffect}>Search</button>
      <div>{description}</div>
    </div>
  )
}

// class App extends React.Component {
//   state = { description: [] }

//   getVote = async () => {
//     const response = await propublica.get("/114/senate/sessions/1/votes/301.json")
//     console.log(response.data.results.votes.vote.description)
//     this.setState({description: response.data.results.votes.vote.description})
//   }

//   render() {
//     return (
//       <div>
//         <button onClick={this.getVote}>Search</button>
//         <div>{this.state.description}</div>
//       </div>
      
//     )
//   }
// }


export default App