
let json_url = `https://jsonplaceholder.typicode.com/todos`
let base_url = `https://todo-data-534ac-default-rtdb.firebaseio.com`
let todos_url = `${base_url}/todos.json`

// Form-Controls
let showTodoForm = document.getElementById('showTodoForm')
let formCard = document.getElementById('card')
let todoForm = document.getElementById('todoForm')
let title = document.getElementById('title')
let userId = document.getElementById('userId')
let todoSubmit = document.getElementById('todoSubmit')
let todoUpdate = document.getElementById('todoUpdate')
let resetForm = document.getElementById('resetForm')
//backDrop And Loader
let backDrop = document.getElementById('backDrop')
let loader = document.getElementById('loader')
//table Control
let tBody = document.getElementById('tBody')
let filterData = document.getElementById('filterData')

let snakeBar = (title,msg = 'success')=>{
    Swal.fire({
        title: title,
        icon: msg,
        timer: 3500
      });
}

let onresetForm = ()=>{
    todoForm.reset()
    todoSubmit.classList.remove('d-none')
    todoUpdate.classList.add('d-none')
}
resetForm.addEventListener('click', onresetForm)

let showLoader = ()=>{
    loader.classList.remove('d-none')
}
let hideLoader = ()=>{
    loader.classList.add('d-none')
}

let closeForm = ()=>{
    formCard.classList.add('d-none')
    backDrop.classList.add('d-none');   
}
let onShowForm = ()=>{
    formCard.classList.remove('d-none');
    backDrop.classList.toggle('d-none');
}
showTodoForm.addEventListener('click', onShowForm)
backDrop.addEventListener('click', closeForm)

let setSrNo = ()=>{
    let tBodyChild = [...tBody.children]
    tBodyChild.forEach((tr,i)=>tr.children[0].innerHTML = i+1)
}

let templating = arr=>{
    result = ``
    arr.forEach(e => {
        result +=`
            <tr id='${e.id}'>
                <th scope="row">loading...</th>
                <td>${e.title}</td>
                <td class="text-center"><button class="btn ${e.completed?'btn-outline-success':'btn-outline-danger'}" onClick="statusHandle(this)"><i class="fa-solid ${e.completed?'fa-check':'fa-xmark'}"></i> ${e.completed?'Completed':'Pending'}</button></td>
                <td class="text-center"><button class="btn btn-success" onClick="onEdit(this)">Edit</button></td>
                <td class="text-center"><button class="btn btn-danger" onClick="onRemove(this)">Remove</button></td>
            </tr>
        `
    });
    tBody.innerHTML=result
}

let createCard = (e,res)=>{
    let tr = document.createElement('tr');
    tr.id = res.name;
    tr.innerHTML =`
        <th scope="row">loading...</th>
        <td>${e.title}</td>
        <td class="text-center"><button class="btn ${e.completed?'btn-outline-success':'btn-outline-danger'}" onClick="statusHandle(this)"><i class="fa-solid ${e.completed?'fa-check':'fa-xmark'}"></i> ${e.completed?'Completed':'Pending'}</button></td>
            <td class="text-center"><button class="btn btn-success" onClick="onEdit(this)">Edit</button></td>
        <td class="text-center"><button class="btn btn-danger" onClick="onRemove(this)">Remove</button></td>
    `
    tBody.append(tr);

}

let makeApiCall = (method,url,data)=>{
    let response = fetch(url,{
        method:method,
        headers:{
            'content':'Application_json',
            'authorization': 'JWT_Access_Token'
        },
        body:data ? JSON.stringify(data) : null,
    })
    return response
}

let fetchData = async()=>{
    showLoader()
    try{
        let response = await makeApiCall('GET', todos_url)
        let data = await response.json(response)
        if(data){
            templating(Object.keys(data).map(e=>({...data[e],id:e})))
            setSrNo()
            // snakeBar('Welcome!!','success')
        }else{
            let response = await makeApiCall("GET",json_url)
            let jsonData = await response.json(response)
            let arrdata = Object.keys(jsonData).map(e=>({...data[e],id:e}))
            templating(Object.keys(jsonData).map(e=>({...data[e],id:e})))
            await arrdata.forEach(e=>{
                let newRes =  makeApiCall('POST', )
            })
        }
    }
    catch(err){
        snakeBar(err,'error')
    }
    finally{
        hideLoader()
    }
}
fetchData()

let onSubmitForm = async(eve)=>{
    eve.preventDefault()
    let newTodo = {
        title:title.value,
        userId:userId.value,
        completed:false
    }
    todoForm.reset()
    showLoader()
    try{
        let response = await makeApiCall("POST",todos_url,newTodo)
        let data = await response.json(response)
        console.log(data);
        createCard(newTodo,data)
        setSrNo()
        snakeBar(`${newTodo.title} To Do Added Successfully !!`)
    }
    catch(err){
        snakeBar(err,'error')
    }
    finally{
        hideLoader()
    }
}
todoForm.addEventListener('submit', onSubmitForm)

let getConfirmation = (title,warning)=>{
    return Swal.fire({
        title: title,
        text: warning,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      })
}

let onRemove =async(eve)=>{
    let removeId = eve.closest('tr').id
    let removeUrl = `${base_url}/todos/${removeId}.json`
    try{
        let result = await getConfirmation('Are You Sure You Want Delete', 'It Will Not Be Reverted')
        if(result.isConfirmed){
            showLoader()
            await makeApiCall("DELETE",removeUrl)
            document.getElementById(removeId).remove()
            setSrNo()
            let removeTitle = eve.closest('tr').children[1].innerHTML
            console.log(removeTitle);
            
            snakeBar(`${removeTitle} Deleted SuccessFully`,'success')
        }
    }
    catch(err){
        snakeBar(err,'error')
    }
    finally{
        hideLoader()
    }
}

let onEdit = async(eve)=>{
    showLoader()
    let editId = eve.closest('tr').id
    localStorage.setItem('editId',editId)
    let editUrl = `${base_url}/todos/${editId}.json`
    try{
        let response = await makeApiCall('GET', editUrl)
        let data = await response.json(response)
        localStorage.setItem('editTitle',data.title)
        title.value = data.title
        userId.value = data.userId
        onShowForm()
        todoUpdate.classList.remove('d-none')
        todoSubmit.classList.add('d-none')
    }
    catch(err){
        snakeBar(err,'error')
    }
    finally{
        hideLoader()
    }
}

let onUpdate = async(eve) =>{
    showLoader()
    let updateId = localStorage.getItem('editId')
    let updateUrl = `${base_url}/todos/${updateId}.json`
    let updatedObj = {
        title:title.value,
        userId:userId.value
    }
    onresetForm()
    try{
        let response = await makeApiCall("PATCH",updateUrl,updatedObj)
        let trChilds = document.getElementById(updateId).children
        trChilds[1].innerHTML = updatedObj.title
        closeForm()
        let updateTitle = localStorage.getItem('editTitle')
        snakeBar(`${updateTitle} To Do is Updated to ${updatedObj.title} Successfully`,'success')
    }
    catch(err){
        snakeBar(err,'error')
    }
    finally{
        hideLoader()
    }
}
todoUpdate.addEventListener('click', onUpdate)

let onFilterData = async(eve)=>{
    showLoader()
    try{
        let response = await makeApiCall("GET",todos_url)
        let data = await response.json(response)
        let dataArr = Object.keys(data).map(e=>({...data[e],id:e}))
        if(eve.target.value == 'all'){
            templating(dataArr)
        }else if(eve.target.value == 'completed'){
            templating(dataArr.filter(e=>e.completed))
        }else if(eve.target.value == 'pending'){
            templating(dataArr.filter(e=>!e.completed))
        }
        setSrNo()
    }
    catch(err){
        snakeBar(err,'error')
    }
    finally{
        hideLoader()
    }
}

filterData.addEventListener('change', onFilterData)

let statusHandle =async (eve)=>{
    let statusId = eve.closest('tr').id
    let statusUrl = `${base_url}/todos/${statusId}.json`
    try{
        showLoader()
        let result = await getConfirmation('Do You Want to Change Status','You Can Change This Again And again')
        if(result.isConfirmed){
            let response = await makeApiCall("GET",statusUrl)
            let data = await response.json(response)
            data.completed = !data.completed
            
            await makeApiCall('PATCH',statusUrl,data)
            let updateStatusOnUi = document.getElementById(statusId).children
            
            updateStatusOnUi[2].innerHTML = 
                    `
                    <button class="btn ${data.completed?'btn-outline-success':'btn-outline-danger'}" onClick="statusHandle(this)"><i class="fa-solid ${data.completed?'fa-check':'fa-xmark'}"></i> ${data.completed?'Completed':'Pending'}</button>
                    `
            snakeBar('Status Changed Successfully')
        }
    }
    catch(err){
        snakeBar(err,'error')
    }
    finally{
        hideLoader()
    }
}