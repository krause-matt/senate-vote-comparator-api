import React, {useState, useEffect, useCallback, useRef, useReducer} from "react"
import propublica from "../api/propublica"
import congress_dates from "./CongressDates"

const App = () => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [rollCall, setRollCall] = useState(null)
  const [year, setYear] = useState(null)
  const [congress, setCongress] = useState(null)
  const [session, setSession] = useState(null)
  const [totVotes, setTotVotes] = useState(null)
  const [voteArray, setVoteArray] = useState([])
  const [positionArray, setPositionArray] = useState([])
  const [senatorOne, setSenatorOne] = useState("")
  const [senatorTwo, setSenatorTwo] = useState("")
  const [senatorOneVote, setSenatorOneVote] = useState("")
  const [senatorTwoVote, setSenatorTwoVote] = useState("")

  const yearRef = useRef(year)
  const rollCallRef = useReducer(rollCall)

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
    if(year && (year!==yearRef.current)) {
      const getVoteNum = async () => {

        const getVoteNumNov = async () => {
          const response_nov = await propublica.get(`senate/votes/${year}-11-02/${year}-12-01.json`)

          if (response_nov.data.results.votes[0]) {
            setTotVotes(response_nov.data.results.votes[0].roll_call)
          } else if (response_nov.data.results.votes[0] === undefined) {
            getVoteNumOct()
          }
        }

        const getVoteNumOct = async () => {
          const response_oct = await propublica.get(`senate/votes/${year}-10-02/${year}-11-01.json`)
          if (response_oct.data.results.votes[0]) {
            setTotVotes(response_oct.data.results.votes[0].roll_call)
          } else {
            document.getElementById("yearSelect").innerText = "Choose Vote"
          }
        }

        const yr_plus_one = (Number(year)+1).toString()
        const response_dec = await propublica.get(`senate/votes/${year}-12-02/${yr_plus_one}-01-01.json`)

        if (response_dec.data.results.votes[0]) {
          setTotVotes(response_dec.data.results.votes[0].roll_call)
        } else if (response_dec.data.results.votes[0] === undefined){
          getVoteNumNov()
        }         
          
      }      

      getVoteNum()      
      yearRef.current = year      
    }

    const buildVoteArray = () => {
      let votes = []
      for (let i = 1; i<= totVotes; i++) {
        votes.push(i)
      }
      setVoteArray(votes)
    }

    buildVoteArray()

    if (rollCall) {
      const getVote = async () => {
        const response = await propublica.get(`/${congress}/senate/sessions/${session}/votes/${rollCall}.json`)
        if (response.data.results) {
          setTitle(response.data.results.votes.vote.bill.title)
          setDescription(response.data.results.votes.vote.description)
          setPositionArray(response.data.results.votes.vote.positions)
        }
        
      }      
      getVote()            
    }
  },[rollCall, year, totVotes])

  const setSenVotes = useCallback(() => {
    console.log(`inside setSenVotes`)
    positionArray.map(item => {
      if(item.name === senatorOne) {
        setSenatorOneVote(item.vote_position)
      } else if (item.name === senatorTwo) {
        setSenatorTwoVote(item.vote_position)
      }
    })
  },[senatorOne, senatorTwo])

  const voteNum = (e) => {
    setRollCall(e.target.value)
  }

  const senOne = (e) => {
    setSenatorOne(e.target.value)
    positionArray.map(item => {
      if(item.name === e.target.value) {
        setSenatorOneVote(item.vote_position)
      } else if (e.target.value === "") {
        setSenatorOneVote("")
      }
    })
  }

  const senTwo = (e) => {
    setSenatorTwo(e.target.value)
    positionArray.map(item => {
      if(item.name === e.target.value) {
        setSenatorTwoVote(item.vote_position)
      } else if (e.target.value === "") {
        setSenatorTwoVote("")
      }
    })
  }

  const buildVotes = voteArray.map((item) => {
    return (
      <option value={item.toString()}>{item}</option>
    )    
  })

  const buildSenatorOne = positionArray.map((item) => {
    if (item.name !== senatorTwo) {
      return (
        <option key={item.member_id} value={item.name}>{item.name}</option>
      )
    }    
  })

  const buildSenatorTwo = positionArray.map((item) => {
    if (item.name !== senatorOne) {
      return (
        <option key={item.member_id} value={item.name}>{item.name}</option>
      )
    }    
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
    <select id="senatorOneSelect" className="ui search dropdown" onChange={senOne}>
      <option value="">Choose 1st Senator (Sorted by last name)</option>
      {buildSenatorOne}
    </select>
    <select id="senatorTwoSelect" className="ui search dropdown" onChange={senTwo}>
      <option value="">Choose 2nd Senator (Sorted by last name)</option>
      {buildSenatorTwo}
    </select>
      <button onClick={setSenVotes}>Search</button>
      <br/>
      <label>Title</label>
      <h5>{title}</h5>
      <label>Description</label>
      <div>{description}</div>
      <label>Senator One Vote</label>
      <div>{senatorOne}{senatorOneVote}</div>
      <label>Senator Two Vote</label>
      <div>{senatorTwo}{senatorTwoVote}</div>
    </div>
  )
}

export default App