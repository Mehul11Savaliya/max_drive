async function handleRequest(url, config, successcode, data = null) {
    let res = await fetch(url, config);
    if (res.status !== successcode) {
        return null;
    }
    else {
        return await res.json();
    }
}

function deleteFolder(id) {
    let ele = document.querySelector("#fold-" + id);
    let folderid = ele.getAttribute('data-id');
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            let url = `/folder/${folderid}`;
            let config = {
                method: 'DELETE'
            }
            let res = handleRequest(url, config, 204);
            if (res === null) Swal.fire('🐦 : Not able to delete file');
            else {
                Swal.fire('🐦 : Your file is now deleted');
                ele.remove();
                update_sidebar();
            }
        }
    })
}

async function home_update_folders(data) {
    try {
        let folders = document.querySelector('#folders');
        folders.innerHTML = "";
        function createFolderCard(data) {
            let div = document.createElement('div');
            div.setAttribute("id", `fold-${data.id}`);
            div.setAttribute("class", "col-md-6 col-sm-6 col-lg-3");
            div.setAttribute("data-id", data.id);
            div.innerHTML = `
        <div class="card card-block card-stretch card-height">
            <div class="card-body">                            
                    <div class="d-flex justify-content-between">
                        <a href="/user/folder/${data.id}" class="folder">
                            <div class="icon-small bg-primary rounded mb-4">
                                <i class="ri-folder-fill"></i>
                            </div>
                        </a>
                        <div class="card-header-toolbar">
                            <div class="dropdown">
                                <span class="dropdown-toggle" id="dropdownMenuButton2" data-toggle="dropdown">
                                    <i class="ri-more-2-fill"></i>
                                </span>
                                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton2">
                                    <a class="dropdown-item" href="#"><i class="ri-eye-fill mr-2"></i>View</a>
                                    <button onclick="deleteFolder(${data.id})" class="dropdown-item"><i class="ri-delete-bin-6-fill mr-2" ></i>Delete</button>
                                    <a class="dropdown-item" href="#"><i class="ri-pencil-fill mr-2"></i>Edit</a>
                                    <a class="dropdown-item" href="#"><i class="ri-printer-fill mr-2"></i>Print</a>
                                    <a class="dropdown-item" href="#"><i class="ri-file-download-fill mr-2"></i>Download</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <a href="" class="folder">
                        <h5 class="mb-2">${data.name}</h5>
                        <p class="mb-2"><i class="lar la-clock text-danger mr-2 font-size-20"></i>${new Date(data.createdAt).toDateString()}</p>
                        <p class="mb-0"><i class="las la-file-alt text-danger mr-2 font-size-20"></i> 0 Files</p>
                    </a>
            </div>
        </div>`;
            return div;
        }

        let res = await fetch('/folder/', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "accept": "application/json"
            }
        })
        res = await res.json();
        res.forEach(folder => {
            let ress = createFolderCard(folder);
            folders.appendChild(ress);
        });
    } catch (error) {

    }
}

async function createFolder() {
    Swal.fire({
        title: 'Create Folder',
        html: `<form>
        <div class="form-group">
          <label for="folder_name">Name</label>
          <input type="email" class="form-control" id="folder_name" placeholder="folder name">
        </div>
        <div class="form-group">
          <label for="folder_tag">Tags</label>
          <input type="email" class="form-control" id="folder_tag" placeholder="separated by ',' ex op,18plus🐦,☠">
        </div>
      </form>`,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText:
            'create',
        confirmButtonAriaLabel: 'create',
        cancelButtonText:
            'cancel',
        cancelButtonAriaLabel: 'cancel'
    }).then(async (result) => {
        if (result.isConfirmed) {
            let folder_name = document.querySelector("#folder_name");
            let folder_tag = document.querySelector("#folder_tag");
            folder_name = folder_name.value.trim();
            folder_tag = folder_tag.value.trim();
            if (folder_name == "") {
                return Swal.fire('Folder name cannot br empty..')
            }
            let config = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    name: folder_name,
                    tags: folder_tag
                })
            }

            let res = await handleRequest('/folder/', config, 201);
            if (res == null) {
                Swal.fire({
                    icon: 'error',
                    text: 'Something went wrong!'
                })
            }
            else {
                home_update_folders();
                update_sidebar();
                Swal.fire({
                    icon: 'success',
                    text: 'folder created'
                })
            }
        }
    });
}

async function update_sidebar(data) {
    let res = await handleRequest('/folder/', { method: "GET" }, 200);
    if (res == null)
        return Swal.fire("something went wrong");
    data = res;
    let datax = {};
    datax.file_manager_data = [];
    data.forEach(obj => {
        datax.file_manager_data.push({ name: obj.name, id: obj.id });
    })

    let { file_manager_data } = datax;
    if (file_manager_data != undefined) {
        let holder = document.querySelector("#mydrive");
        holder.innerHTML = "";
        file_manager_data.forEach((val) => {
            let li = document.createElement("li");
            li.innerHTML = `<a href="/user/folder/${val.id}">
            <i class="la la-folder"></i><span>${val.name}</span>
        </a>`;
            holder.appendChild(li);
        })
    }
}

async function upload_file() {
    Swal.fire({
        title: 'upload file',
        html: `
        <form id="filestoupload" enctype="multipart/form-data">
        <div class="row" id="fm-wizard-holder">
        </div>
        </form>
        <div class="row">
        <div class="col-lg-4 col-md-8 col-sm-11">
        <button class="btn btn-primary" onclick="generateWizardCard(event)">Add media</button>
        </div>
        </div>`,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText:'save',
        confirmButtonAriaLabel: 'save',
        cancelButtonText:'cancel',
        cancelButtonAriaLabel: 'cancel'
    }).then(async(res)=>{
        if(res.isConfirmed){
            let formData = new FormData(document.querySelector("#filestoupload"));
            let url = document.location.href;
            let folder_id  = url.split('/');
            folder_id = folder_id[folder_id.length-1];
            folder_id = Number.parseInt(folder_id.trim().replaceAll('?','').replaceAll('#',''));
            formData.append("folder",folder_id);
            let config = {
                        method : "POST",
                        headers:{
                            "Accept":"application/json"
                        },
                        body : formData
                    }
                    console.log(formData.entries());
                    let data = await handleRequest("/file/",config,201);
                    console.log(data);
        }  
    });

    // let file  = document.createElement("input");
    //     file.setAttribute("type","file");
    //     file.setAttribute("name","file");
    //     file.click();
    //     let formData = new FormData();
    //     formData.append("file",file);
    //     let config = {
    //         method : "POST",
    //         headers:{
    //             "Content-Type":"application/multipart-formdata",
    //             "Accept":"application/json"
    //         },
    //         body : formData
    //     }
    //     console.log(formData.entries());
    //     let data = await handleRequest("/file/",config,201);
    //     console.log(data);
}

let i=0;
const generateWizardCard = (event) => {

    let holder = document.querySelector("#fm-wizard-holder");
    let row = document.createElement("div");
    row.setAttribute("class", "row");
    row.innerHTML = `<div class="col-lg-4"><span class="badge badge-pill badge-danger">Delete</span></div><div class="col-lg-8 col-md-8 col-sm-11 my-2"> <input class="form-control form-control-sm" id="file-${i}" name="file" type="file"><div>`;
    holder.appendChild(row);
    document.getElementById(`file-${i}`).click();
    i++;
}

async function load_files(params) {
    let folder_flag  = document.querySelector("#folder").value;
    if(folder_flag=="true"){
        let url = document.location.href;
        let folder_id  = url.split('/');
        folder_id = folder_id[folder_id.length-1];
        folder_id = Number.parseInt(folder_id.trim().replaceAll('?','').replaceAll('#',''));

        let config={
            method:"GET"
        }
        let ress  = await handleRequest(`/file/all?folder=${folder_id}`,config,200);
        // if(ress==null){
        //     Swal.fire({
        //         icon: 'error',
        //         title: 'Oops...',
        //         text: 'Something went wrong!',
        //         footer: '<a href="">Why do I have this issue?</a>'
        //       })
        // }
        generate_folder_file_cards(ress);
    }
}

function generate_folder_file_cards(files) {
    let tbody = document.querySelector("#rowsholder")
    let file_gridcard  = document.querySelector("#files");

    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        let tr = document.createElement("tr");
        tr.innerHTML=`<td>
        <div class="d-flex align-items-center">
            <div class="mr-3">
                <a href="#"><img src="/assets/images/layouts/page-1/01.png" class="img-fluid avatar-30" alt="image1"></a>
            </div>
            ${file.metadata.name}
        </div>
    </td>
    <td>Me</td>
    <td>${new Date(file.createdAt).toDateString()}</td>
    <td>${file.size/(1024)} mb</td>
    <td>
        <div class="dropdown">
            <span class="dropdown-toggle" id="dropdownMenuButton6" data-toggle="dropdown">
                <i class="ri-more-fill"></i>
            </span>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton6">
                <a class="dropdown-item" href="#"><i class="ri-eye-fill mr-2"></i>View</a>
                <a class="dropdown-item" href="#"><i class="ri-delete-bin-6-fill mr-2"></i>Delete</a>
                <a class="dropdown-item" href="#"><i class="ri-pencil-fill mr-2"></i>Edit</a>
                <a class="dropdown-item" href="#"><i class="ri-printer-fill mr-2"></i>Print</a>
                <a class="dropdown-item" href="#"><i class="ri-file-download-fill mr-2"></i>Download</a>
            </div>
        </div>
    </td>`;
        tbody.appendChild(tr);

        let gridcard = document.createElement("div");
        gridcard.setAttribute("class","col-lg-3 col-md-6 col-sm-6");
        gridcard.innerHTML=`    <div class="card card-block card-stretch card-height">
        <div class="card-body image-thumb ">
            <div class="mb-4 text-center p-3 rounded iq-thumb">
                <a class="image-popup-vertical-fit" href="/assets/images/layouts/page-1/01.png">
                    <img src="/assets/images/layouts/page-1/01.png" class="img-fluid" alt="images">
                    <div class="iq-image-overlay"></div>
                </a>
            </div>
            <h6>${file.metadata.name}</h6>
        </div>
    </div>`;
    file_gridcard.appendChild(gridcard);
    }
}

window.onload = async () => {
    update_sidebar();
    home_update_folders();
    load_files();
}