import React, {useState, useEffect} from "react"
import propublica from "../api/propublica"

const App = () => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [rollCall, setRollCall] = useState(null)
  const [year, setYear] = useState(null)
  const [congress, setCongress] = useState(null)
  const [session, setSession] = useState(null)
  const [totVotes, setTotVotes] = useState(null)
  const [voteArray, setVoteArray] = useState([])

  const congress_dates = [
    {year: "1989", congress: "101", session: "1"},
    {year: "1990", congress: "101", session: "2"},
    {year: "1991", congress: "102", session: "1"},
    {year: "1992", congress: "102", session: "2"},
    {year: "1993", congress: "103", session: "1"},
    {year: "1994", congress: "103", session: "2"},
    {year: "1995", congress: "104", session: "1"},
    {year: "1996", congress: "104", session: "2"},
    {year: "1997", congress: "105", session: "1"},
    {year: "1998", congress: "105", session: "2"},
    {year: "1999", congress: "106", session: "1"},
    {year: "2000", congress: "106", session: "2"},
    {year: "2001", congress: "107", session: "1"},
    {year: "2002", congress: "107", session: "2"},
    {year: "2003", congress: "108", session: "1"},
    {year: "2004", congress: "108", session: "2"},
    {year: "2005", congress: "109", session: "1"},
    {year: "2006", congress: "109", session: "2"},
    {year: "2007", congress: "110", session: "1"},
    {year: "2008", congress: "110", session: "2"},
    {year: "2009", congress: "111", session: "1"},
    {year: "2010", congress: "111", session: "2"},
    {year: "2011", congress: "112", session: "1"},
    {year: "2012", congress: "112", session: "2"},
    {year: "2013", congress: "113", session: "1"},
    {year: "2014", congress: "113", session: "2"},
    {year: "2015", congress: "114", session: "1"},
    {year: "2016", congress: "114", session: "2"},
    {year: "2017", congress: "115", session: "1"},
    {year: "2018", congress: "115", session: "2"},
    {year: "2019", congress: "116", session: "1"},
    {year: "2020", congress: "116", session: "2"}
  ]

  const congressList = congress_dates.map((item) => {
    const c_identify = item.congress === "101" ? "st" : "th"
    const s_identify = item.session === "1" ? "st" : "nd"
    return (
      <option data-year={item.year} data-congress={item.congress} data-session={item.session} value={`year: ${item.year}, congress: ${item.congress}, session: ${item.session}`}>{`${item.year} (${item.congress}${c_identify} - ${item.session}${s_identify})`}</option>
    )
  })

  const congressState = (e) => {
    setYear(e.target.options[e.target.selectedIndex].dataset.year)
    setCongress(e.target.options[e.target.selectedIndex].dataset.congress)
    setSession(e.target.options[e.target.selectedIndex].dataset.session)
    setTitle(null)
    setDescription(null)
  }

  useEffect(() => {

    if (rollCall) {
      const getVote = async () => {
        // const response = await propublica.get(`/114/senate/sessions/1/votes/${rollCall}.json`)
        const response = await propublica.get(`/${congress}/senate/sessions/${session}/votes/${rollCall}.json`)
        if (response.data.results) {
          setTitle(response.data.results.votes.vote.bill.title)
          setDescription(response.data.results.votes.vote.description)
          console.log(response)
        }
        
      }      

      getVote()
      
    }

    if(year) {
      const getVoteNum = async () => {
        const yr_plus_one = (Number(year)+1).toString()
        const response_dec = await propublica.get(`senate/votes/${year}-12-05/${yr_plus_one}-01-04.json`)
        const response_nov = await propublica.get(`senate/votes/${year}-11-05/${year}-12-04.json`)
        if (response_dec.data.results.votes[0]) {
          setTotVotes(response_dec.data.results.votes[0].roll_call)
        } else if (response_nov.data.results.votes[0]){
          setTotVotes(response_nov.data.results.votes[0].roll_call)
        } else {
          document.getElementById("yearSelect").innerText = "Choose Vote"
        }
        
      }

    const buildVoteArray = () => {
      let votes = []
      for (let i = 1; i<= totVotes; i++) {
        votes.push(i)
      }
      setVoteArray(votes)
    }

      getVoteNum()
      buildVoteArray()
    }

  },[rollCall, year, totVotes]) //original: [rollCall, year, totVotes]

  const voteNum = (e) => {
    setRollCall(e.target.value)
  }

  const buildVotes = voteArray.map((item) => {
    return (
      <option value={item.toString()}>{item}</option>
    )    
  })

  return (
    <div>
    <select className="ui search dropdown" onChange={congressState}>
      <option value="">Select a Year and Congress</option>
      {congressList}
    </select>
    <select id="yearSelect" className="ui search dropdown" onChange={voteNum}>
      <option value="">Choose Vote</option>
      {buildVotes}
    </select>
      <button onClick={() => useEffect}>Search</button>
      <h5>{title}</h5>
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