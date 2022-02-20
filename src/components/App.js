import React, {useState, useEffect, useRef} from "react"
import propublica from "../api/propublica"
import congress_dates from "./CongressDates"

const App = () => {
  const [title, setTitle] = useState("Select congress then vote to see Title")
  const [description, setDescription] = useState("Select congress then vote to see Description")
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
  const [senatorOneParty, setSenatorOneParty] = useState("")
  const [senatorTwoParty, setSenatorTwoParty] = useState("")
  const [senatorOneState, setSenatorOneState] = useState("")
  const [senatorTwoState, setSenatorTwoState] = useState("")
  const [updating, setUpdating] = useState(null)

  const yearRef = useRef(year)
  const rollCallRef = useRef(rollCall)
  const totVotesRef = useRef(totVotes)

  const congressList = congress_dates.map((item) => {
    const c_identify = item.congress === "101" ? "st" : item.congress === "102" ? "nd" : item.congress === "103" ? "rd" : "th"
    const s_identify = item.session === "1" ? "st" : "nd"
    return (
      <option key={item.year} data-year={item.year} data-congress={item.congress} data-session={item.session} value={`year: ${item.year}, congress: ${item.congress}, session: ${item.session}`}>{`${item.year} (${item.congress}${c_identify} - ${item.session}${s_identify})`}</option>
    )
  })

  const congressState = (e) => {
    setYear(e.target.options[e.target.selectedIndex].dataset.year)
    setCongress(e.target.options[e.target.selectedIndex].dataset.congress)
    setSession(e.target.options[e.target.selectedIndex].dataset.session)
  }

  useEffect(() => {

    //console.log(`useEffect: year = ${year}, yearRef = ${yearRef.current}, rollCall = ${rollCall}, rollCallRef = ${rollCallRef.current}, totVotes = ${totVotes}, totVotesRef = ${totVotesRef.current}`)

    if(year && (year!==yearRef.current)) {

      setTotVotes(null)
      setPositionArray([])
      setTitle("Select congress then vote to see Title")
      setDescription("Select congress then vote to see Description")
      setSenatorOne("")
      setSenatorTwo("")
      setSenatorOneVote("")
      setSenatorTwoVote("")
      setSenatorOneParty("")
      setSenatorTwoParty("")
      setSenatorOneState("")
      setSenatorTwoState("")

      const getVoteNum = async () => {
        setUpdating("updating")

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
            document.getElementById("yearSelect").innerText = "TEST"
          }
        }

        const yr_plus_one = (Number(year)+1).toString()
        const response_dec = await propublica.get(`senate/votes/${year}-12-02/${yr_plus_one}-01-01.json`)
        

        if (response_dec.data.results.votes[0]) {
          setTotVotes(response_dec.data.results.votes[0].roll_call)
        } else if (response_dec.data.results.votes[0] === undefined){
          getVoteNumNov()
        }
        setUpdating(null)
      }      

      getVoteNum()
     
      yearRef.current = year
      totVotesRef.current = totVotes
      
    }

    const buildVoteArray = () => {      
      let votes = []
      for (let i = 1; i<= totVotes; i++) {
        votes.push(i)
      }
      setVoteArray(votes)
    }

    buildVoteArray()

    if (rollCall && rollCall !== rollCallRef.current) {
      const getVote = async () => {
        const response = await propublica.get(`/${congress}/senate/sessions/${session}/votes/${rollCall}.json`)
        if (response.data.results) {
          if (response.data.results.votes.vote.bill.title) {
            setTitle(response.data.results.votes.vote.bill.title)            
          } else {
            setTitle("Title not available for this bill")
          }          
          setDescription(response.data.results.votes.vote.description)
          setPositionArray(response.data.results.votes.vote.positions)
          const senOneDropDown = document.getElementById("senatorOneSelect");
          const senTwoDropDown = document.getElementById("senatorTwoSelect");
          senOneUpdate(senOneDropDown.value);
          senTwoUpdate(senTwoDropDown.value);
        }
        
      }      
      getVote()
      
      rollCallRef.current = rollCall
    }
  },[rollCall, year, totVotes])

  const voteNum = (e) => {
    setTitle("Loading...")
    setDescription("Loading...")
    setRollCall(e.target.value)
  }

  const senOneParty = (party) => {
    if (party === "D") {
      setSenatorOneParty("Democrat")
    } else if (party === "R") {
      setSenatorOneParty("Republican")
    } else if (party === "ID") {
      setSenatorOneParty("Independent")
    } else {
      setSenatorOneParty("")
    }
  }

  const senTwoParty = (party) => {
    if (party === "D") {
      setSenatorTwoParty("Democrat")
    } else if (party === "R") {
      setSenatorTwoParty("Republican")
    } else if (party === "ID") {
      setSenatorTwoParty("Independent")
    } else {
      setSenatorTwoParty("")
    }
  }

  const senOne = (e) => {
    setSenatorOne(e.target.value)
    positionArray.map(item => {
      if(item.name === e.target.value) {
        setSenatorOneVote(item.vote_position)
        senOneParty(item.party)
        setSenatorOneState(item.state)
      } else if (e.target.value === "") {
        setSenatorOneVote("")
        setSenatorOneParty("")
        setSenatorOneState("")
      }
    })
  }

  const senOneUpdate = (senName) => {
    setSenatorOne(senName)
    positionArray.map(item => {
      if(item.name === senName) {
        setSenatorOneVote(item.vote_position)
        senOneParty(item.party)
        setSenatorOneState(item.state)
      } else if (senName === "") {
        setSenatorOneVote("")
        setSenatorOneParty("")
        setSenatorOneState("")
      }
    })
  }

  const senTwo = (e) => {
    setSenatorTwo(e.target.value)
    positionArray.map(item => {
      if(item.name === e.target.value) {
        setSenatorTwoVote(item.vote_position)
        senTwoParty(item.party)
        setSenatorTwoState(item.state)
      } else if (e.target.value === "") {
        setSenatorTwoVote("")
        setSenatorTwoParty("")
        setSenatorTwoState("")
      }
    })
  }

  const senTwoUpdate = (senName) => {
    setSenatorTwo(senName)
    positionArray.map(item => {
      if(item.name === senName) {
        setSenatorTwoVote(item.vote_position)
        senTwoParty(item.party)
        setSenatorTwoState(item.state)
      } else if (senName === "") {
        setSenatorTwoVote("")
        setSenatorTwoParty("")
        setSenatorTwoState("")
      }
    })
  }



  const buildVotes = voteArray.map((item) => {
    return (
      <option key={item} value={item.toString()}>{item}</option>
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

  

  const clearSearch = () => {
    const cReset = document.getElementById("congressSelect").innerHTML    
    setCongress(null)
    setSession(null)
    setTitle("Select congress then vote to see Title")
    setDescription("Select congress then vote to see Description")
    setSenatorOne("")
    setSenatorTwo("")
    setSenatorOneVote("")
    setSenatorTwoVote("")
    setSenatorOneParty("")
    setSenatorTwoParty("")
    setSenatorOneState("")
    setSenatorTwoState("")
    setTotVotes(null)
    document.getElementById("congressSelect").innerHTML = cReset    
    setPositionArray([])
  }

  return (
    <div className="container">
      <div className="container mt-3">
        <nav className="navbar bg-primary rounded">
          <div className="container-fluid">
            <h4 className="text-light"><strong>Senate Vote Comparison Tool</strong></h4>
          </div>
        </nav>
      </div>      
      <form className="mt-3">
        <div className="container mb-3">
          <select id="congressSelect" className="form-select" onChange={congressState}>
            <option value="">Select a Year and Congress</option>
            {congressList}
          </select>
        </div>
        <div className="container mb-3">
          <select id="yearSelect" className="form-select" onChange={voteNum}>
            {(updating != null) ? <option value="">Loading...</option> : <option value="">Choose Vote</option>}              
            {buildVotes}         
            </select>
        </div>
        <div className="container mb-3">
          <div className="row">
            <div className="col">
              <select id="senatorOneSelect" className="form-select" onChange={senOne}>
                <option value="">Choose 1st Senator</option>
                {buildSenatorOne}
              </select>
            </div>
            <div className="col">
              <select id="senatorTwoSelect" className="form-select" onChange={senTwo}>
                <option value="">Choose 2nd Senator</option>
                {buildSenatorTwo}
              </select>
            </div>
          </div>
        </div>
        <div className="container">
          <button type="button" className="btn btn-danger mb-5" onClick={clearSearch}>Clear</button>
          <div className="card">
            <div className="card-header">
              <strong>Title</strong>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">{title}</li>
            </ul>
            <div className="card-header">
            <strong>Description</strong>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">{description}</li>
            </ul>
          </div>
          <div className="row mt-3">
            <div className="col">
              <div className="card">
                <div className="card-header">
                  <strong>1st Senator</strong>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">{senatorOne}</h5>
                  <p className="card-text">{senatorOneParty === "" ? "" : `Party: ${senatorOneParty}`}</p>
                  <p className="card-text">{senatorOneState === "" ? "" : `State: ${senatorOneState}`}</p>
                  <p className="card-text">{senatorOneVote === "" ? "" : `Vote: ${senatorOneVote}`}</p>
                </div>                                
              </div>
            </div>
            <div className="col">
              <div className="card">
                <div className="card-header">
                  <strong>2nd Senator</strong>
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-3">{senatorTwo}</h5>
                  <p className="card-text">{senatorTwoParty === "" ? "" : `Party: ${senatorTwoParty}`}</p>
                  <p className="card-text">{senatorTwoState === "" ? "" : `State: ${senatorTwoState}`}</p>
                  <p className="card-text">{senatorTwoVote === "" ? "" : `Vote: ${senatorTwoVote}`}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    
  )
}

export default App