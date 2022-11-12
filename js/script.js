if (!localStorage.getItem("conversions")) localStorage.setItem("conversions", JSON.stringify([]))

let conversions = []

//url object
const urlObject = {
    mainURL: `https://api.exchangerate.host/convert`,
    fromQry: document.getElementById("baseCurrency").value,
    toQry: document.getElementById("toCurrency").value,
    amountQry: document.getElementById("amount").value,

    //update properties
    retrieveData: function() {
        this.fromQry = document.getElementById("baseCurrency").value
        this.toQry = document.getElementById("toCurrency").value
        this.amountQry = document.getElementById("amount").value
    },

    absoluteURL: function() {
        return `${this.mainURL}?from=${this.fromQry}&to=${this.toQry}&amount=${this.amountQry}`
    }
}

//fetch json
fetch("/json/currency.json")
    .then(res => res.json())
    .then(data => {
        //get value objects only
        data = Object.values(data)

        //construct options for select elements
        const baseCurrency = data.map(({ code, name }) => `<option value="${code}">${name}</option>`).join("")
        document.getElementById("baseCurrency").innerHTML = baseCurrency

        const toCurrency = data.map(({ code, name }) => `<option value="${code}">${name}</option>`).join("")
        document.getElementById("toCurrency").innerHTML = toCurrency

        //preprend default option (CAD)
        document.getElementById("baseCurrency").value = "CAD"
        document.getElementById("toCurrency").value = "CAD"
    })

//prevent default submit event
document.addEventListener("submit", e => {
    e.preventDefault()
})

const createRecord = (data) => {
    //destructure response data
    const { result, query: { from, to, amount }, info: { rate } } = data

    //create record object
    const record = {
        from,
        to,
        rate: rate.toFixed(2),
        amount,
        payment: result.toFixed(2),
        date: new Date().toLocaleString()
    }

    //add record
    conversions.push(record)

    //append to localstorage
    const local = JSON.parse(localStorage.getItem("conversions"))
    local.push(record)
    localStorage.setItem("conversions", JSON.stringify(local))

    //update table
    displayRecords()
}

const displayRecords = () => {
    //reset table
    const table = document.querySelector("tbody")
    table.innerHTML = ""

    //for each conversion, create rows
    conversions.forEach(({ from, to, rate, amount, payment, date }) => {
        const row = document.createElement("tr")
        row.innerHTML = `
            <td>${from}</td>
            <td>${to}</td>
            <td>${rate}</td>
            <td>${amount}</td>
            <td>${payment}</td>
            <td>${date}</td>
        `
        table.appendChild(row)
    })
}

document.getElementById("convert").addEventListener("click", () => {
    //get values from input fields
    urlObject.retrieveData()

    //fetch data
    fetch(urlObject.absoluteURL())
        .then(res => res.json())
        .then(data => {
            createRecord(data)
        })
})

document.getElementById("showHistory").addEventListener("click", () => {
    //load history
    conversions = JSON.parse(localStorage.getItem("conversions"))

    //update table
    displayRecords()
})

document.getElementById("clearHistory").addEventListener("click", () => {
    //clear history
    conversions = []
    localStorage.setItem("conversions", JSON.stringify([]))

    //update table
    displayRecords()
})