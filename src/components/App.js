import React, {useState, useEffect, useCallback, useRef} from "react"
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

  const yearRef = useRef(year)

  const congressList = congress_dates.map((item) => {
    // const c_identify = item.congress === "101" ? "st" : "th"
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
    // setTitle(null)
    // setDescription(null)
  }

  useEffect(() => {

    if(year && (year!==yearRef.current)) {
      document.getElementById("yearSelect").innerHTML = `<option value="">Loading...</option>`
      const getVoteNum = async () => {        

        const getVoteNumNov = async () => {
          const response_nov = await propublica.get(`senate/votes/${year}-11-02/${year}-12-01.json`)

          if (response_nov.data.results.votes[0]) {
            setTotVotes(response_nov.data.results.votes[0].roll_call)
            document.getElementById("yearSelect").innerHTML = `<option value="">Choose Vote</option>`
          } else if (response_nov.data.results.votes[0] === undefined) {
            getVoteNumOct()
          }
        }

        const getVoteNumOct = async () => {
          const response_oct = await propublica.get(`senate/votes/${year}-10-02/${year}-11-01.json`)
          if (response_oct.data.results.votes[0]) {
            setTotVotes(response_oct.data.results.votes[0].roll_call)
            document.getElementById("yearSelect").innerHTML = `<option value="">Choose Vote</option>`
          } else {
            document.getElementById("yearSelect").innerText = "Choose Vote"
          }
        }

        const yr_plus_one = (Number(year)+1).toString()
        const response_dec = await propublica.get(`senate/votes/${year}-12-02/${yr_plus_one}-01-01.json`)

        if (response_dec.data.results.votes[0]) {
          setTotVotes(response_dec.data.results.votes[0].roll_call)
          document.getElementById("yearSelect").innerHTML = `<option value="">Choose Vote</option>`

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
          if (response.data.results.votes.vote.bill.title) {
            setTitle(response.data.results.votes.vote.bill.title)            
          } else {
            setTitle("Title not available for this bill")
          }          
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
    setTitle("Loading...")
    setDescription("Loading...")
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
    setYear(null)
    setCongress(null)
    setSession(null)
    setTitle("Select congress then vote to see Title")
    setDescription("Select congress then vote to see Description")
    setSenatorOne("")
    setSenatorTwo("")
    setSenatorOneVote("")
    setSenatorTwoVote("")
    document.getElementById("congressSelect").innerHTML = cReset
    document.getElementById("yearSelect").innerHTML = `<option value="">Choose Vote</option>`
    setPositionArray([])
  }

  return (
    <div className="container">
      <div className="container mt-1">
        <nav className="navbar bg-primary rounded">
          <div className="container-fluid">
            <h4 className="text-light"><strong>Senate Vote Comparison Tool</strong></h4>
          </div>
        </nav>
      </div>      
      <form className="mt-5">
        <div className="container mb-5">
          <select id="congressSelect" className="form-select" onChange={congressState}>
            <option value="">Select a Year and Congress</option>
            {congressList}
          </select>
        </div>
        <div className="container mb-5">
          <select id="yearSelect" className="form-select" onChange={voteNum}>
            <option value="">Choose Vote</option>
            {buildVotes}
          </select>
        </div>
        <div className="container mb-5">
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
          <div className="row mt-5">
            <div className="col">
              <div className="card">
                <div className="card-header">
                  <strong>1st Senator Vote</strong>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{senatorOne}</h5>
                  <p className="card-text">{senatorOneVote}</p>
                </div>                                
              </div>
            </div>
            <div className="col">
              <div className="card">
                <div className="card-header">
                  <strong>2nd Senator Vote</strong>
                </div>
                <div className="card-body">
                  <h5 className="card-title">{senatorTwo}</h5>
                  <p className="card-text">{senatorTwoVote}</p>
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