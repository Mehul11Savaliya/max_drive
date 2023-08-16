let notifier = new AWN({
    icons: {
        enabled: false,
        prefix: '<i class="las la-check-double',
        suffix: '></i>'
    }
});

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

async function deleteFile(id) {
    let rowcd = document.getElementById(`tr-${id}`);
    let gridcd = document.getElementById(`gridtr-${id}`);
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            let res = await fetch(`/file/${id}`, {
                method: "DELETE"
            });
            console.log(res);
            if (res.status != 204) {
                notifier.alert("file not deleted..");
            } else {
                notifier.success("file deleted..");
                rowcd.remove();
                gridcd.remove();
                return true;
            }
        }
    });
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
        confirmButtonText: 'save',
        confirmButtonAriaLabel: 'save',
        cancelButtonText: 'cancel',
        cancelButtonAriaLabel: 'cancel'
    }).then(async (res) => {
        if (res.isConfirmed) {
            let formData = new FormData(document.querySelector("#filestoupload"));
            let url = document.location.href;
            let folder_id = url.split('/');
            folder_id = folder_id[folder_id.length - 1];
            folder_id = Number.parseInt(folder_id.trim().replaceAll('?', '').replaceAll('#', ''));
            formData.append("folder", folder_id);
            let config = {
                method: "POST",
                headers: {
                    "Accept": "application/json"
                },
                body: formData
            }
            let data;
            // new AWN().async(
            //     data = await handleRequest("/file/", config, 201),
            //     'Posts has been loaded',
            // )
            let notifier = new AWN({
                icons: {
                    enabled: false,
                    prefix: '<i class="las la-check-double',
                    suffix: '></i>'
                }
            });

            // let res = await fetch('/file/', config);
            notifier.async(fetch('/file/', config), async (resp) => {
                if (resp.status != 201) {
                    notifier.alert("not able to upload right now..");
                } else {
                    resp = await resp.json();
                    let url = document.location.href;
                    let folder_id = url.split('/');
                    folder_id = folder_id[folder_id.length - 1];
                    folder_id = Number.parseInt(folder_id.trim().replaceAll('?', '').replaceAll('#', ''));
                    let config = {
                        method: "GET"
                    }
                    let ress = await handleRequest(`/file/all?folder=${folder_id}`, config, 200);
                    generate_folder_file_cards(ress);
                    notifier.success(`${resp.length} files has been loaded`)
                }
            }, err => {
                notifier.alert("error in uploading..");
            })
            // if (res.status != 201) {
            //     notifier.alert("not able to upload right now..");
            // } else {
            //     notifier.async(
            //         res.json(),
            //         async (resp) => {
            //             let url = document.location.href;
            //             let folder_id = url.split('/');
            //             folder_id = folder_id[folder_id.length - 1];
            //             folder_id = Number.parseInt(folder_id.trim().replaceAll('?', '').replaceAll('#', ''));
            //             let config = {
            //                 method: "GET"
            //             }
            //             let ress = await handleRequest(`/file/all?folder=${folder_id}`, config, 200);
            //             generate_folder_file_cards(ress);
            //             notifier.success(`${resp.length} files has been loaded`)
            //         },
            //         error => {
            //             notifier.alert("error in response..");
            //         }
            //     );

            // }
            // console.log(data);

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

let i = 0;
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
    let folder_flag = document.querySelector("#folder").value;
    if (folder_flag == "true") {
        let btn = document.querySelector('body > div.content-page > div > div.row > div > div > div.d-flex.align-items-center > div.list-grid-toggle.mr-4 > span.icon.i-grid.icon-grid > i');

        setTimeout(() => {
            btn.click();
        }, 700);


        let url = document.location.href;
        let folder_id = url.split('/');
        folder_id = folder_id[folder_id.length - 1];
        folder_id = Number.parseInt(folder_id.trim().replaceAll('?', '').replaceAll('#', ''));

        let config = {
            method: "GET"
        }
        let ress = await handleRequest(`/file/all?folder=${folder_id}`, config, 200);
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
    let file_gridcard = document.querySelector("#files");
    file_gridcard.innerHTML = "";
    tbody.innerHTML = "";

    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        let tr = document.createElement("tr");
        tr.setAttribute("id", `tr-${file.id}`);

        let tp = file.metadata.name.split('.');
        let ext = tp[tp.length - 1];
        let thumdimg = "";
        switch (ext) {
            case 'pptx':
                thumdimg = '/assets/images/layouts/page-1/ppt.png'
                break;
            case 'pdf':

                thumdimg = '/assets/images/layouts/page-1/pdf.png'
                break;
            case 'xlsx':

                thumdimg = '/assets/images/layouts/page-1/xlsx.png'
                break;
            case 'docx':

                thumdimg = '/assets/images/layouts/page-1/doc.png'
                break;
            case 'msi':

                thumdimg = '/assets/images/layouts/page-1/msi.png'
                break;
            case 'zip':

                thumdimg = '/assets/images/layouts/page-1/zip.png'
                break;
            case 'exe':

                thumdimg = '/assets/images/layouts/page-1/exe.png'
                break;
            case 'mkv':
                thumdimg = '/assets/images/layouts/page-1/media.png'
                break;
            default:
                thumdimg = file.metadata.path;
                break;
        }
        tr.innerHTML = `<td>
        <div class="d-flex align-items-center">
            <div class="mr-3">
                <a href="/file/${file.id}"><img src="${thumdimg}" class="img-fluid avatar-30" alt="image1"></a>
            </div>
            ${file.metadata.name}
        </div>
    </td>
    <td>${file.createdBy}</td>
    <td>${new Date(file.createdAt).toDateString()}</td>
    <td>${((file.metadata.size / 1024) / 1024).toFixed(3)} mb</td>
    <td>
        <div class="dropdown">
            <span class="dropdown-toggle" id="dropdownMenuButton6" data-toggle="dropdown">
                <i class="ri-more-fill"></i>
            </span>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton6">
                <a class="dropdown-item" href="/file/${file.id}"><i class="ri-eye-fill mr-2"></i>View</a>
                <button onclick="deleteFile(${file.id})" class="dropdown-item"><i class="ri-delete-bin-6-fill mr-2"></i>Delete</button>
                <a class="dropdown-item" href="#"><i class="ri-pencil-fill mr-2"></i>Edit</a>
                <a class="dropdown-item" href="#"><i class="ri-printer-fill mr-2"></i>Print</a>
                <a class="dropdown-item" href="#"><i class="ri-file-download-fill mr-2"></i>Download</a>
            </div>
        </div>
    </td>`;
        tbody.appendChild(tr);

        let gridcard = document.createElement("div");
        gridcard.setAttribute("class", "col-lg-3 col-md-6 col-sm-6");
        gridcard.setAttribute("id", `gridtr-${file.id}`);
        switch (ext) {
            case 'docx':
                gridcard.innerHTML = `<div class="card card-block card-stretch card-height">
                <div class="card-body image-thumb">
                    <div class="mb-4 text-center p-3 rounded iq-thumb">
                        <div class="iq-image-overlay"></div>
                        <a href="#" id="docx-container" data-title="${file.metadata.name}" data-load-file="file" data-load-target="#resolte-contaniner" data-url="${file.metadata.path}" data-toggle="modal" data-target="#exampleModal"><img src="/assets/images/layouts/page-1/doc.png" class="img-fluid" alt="image1"></a>
                    </div>
                    <h6>${file.metadata.name}</h6>
                </div>
            </div>`;
                break;
            case 'pdf':
                gridcard.innerHTML = `<div class="card card-block card-stretch card-height">
                <div class="card-body image-thumb">
                    <div class="mb-4 text-center p-3 rounded iq-thumb">
                        <div class="iq-image-overlay"></div>
                        <a href="#" id="pdf-container" data-title="${file.metadata.name}" data-load-file="file" data-load-target="#resolte-contaniner" data-url="${file.metadata.path}" data-toggle="modal" data-target="#exampleModal"><img src="/assets/images/layouts/page-1/pdf.png" class="img-fluid" alt="image1"></a>
                    </div>
                    <h6>${file.metadata.name}</h6>
                </div>
            </div>`;
                break;
            case 'pptx':
                gridcard.innerHTML = `<div class="card card-block card-stretch card-height">
                <div class="card-body image-thumb">
                    <div class="mb-4 text-center p-3 rounded iq-thumb">
                        <div class="iq-image-overlay"></div>
                        <a href="#" id="pptx-container" data-title="${file.metadata.name}" data-load-file="file" data-load-target="#resolte-contaniner" data-url="${file.metadata.path}" data-toggle="modal" data-target="#exampleModal"><img src="/assets/images/layouts/page-1/ppt.png" class="img-fluid" alt="image1"></a>
                    </div>
                    <h6>${file.metadata.name}</h6>
                </div>
            </div>`;
                break;
            case 'xlsx':
                gridcard.innerHTML = `<div class="card card-block card-stretch card-height">
                <div class="card-body image-thumb">
                    <div class="mb-4 text-center p-3 rounded iq-thumb">
                        <div class="iq-image-overlay"></div>
                        <a href="#" id="xlsx-container" data-title="${file.metadata.name}" data-load-file="file" data-load-target="#resolte-contaniner" data-url="${file.metadata.path}" data-toggle="modal" data-target="#exampleModal"><img src="/assets/images/layouts/page-1/xlsx.png" class="img-fluid" alt="image1"></a>
                    </div>
                    <h6>${file.metadata.name}</h6>
                </div>
            </div>`;
                break;
            case 'msi':
                gridcard.innerHTML = `<div class="card card-block card-stretch card-height">
                <div class="card-body image-thumb">
                    <div class="mb-4 text-center p-3 rounded iq-thumb">
                        <div class="iq-image-overlay"></div>
                        <a href="#" id="xlsx-container" data-title="${file.metadata.name}" data-load-file="file" data-load-target="#resolte-contaniner" data-url="${file.metadata.path}" data-toggle="modal" data-target="#exampleModal"><img src="/assets/images/layouts/page-1/msi.png" class="img-fluid" alt="image1"></a>
                    </div>
                    <h6>${file.metadata.name}</h6>
                </div>
            </div>`;
                break;
            case 'zip':
                gridcard.innerHTML = `<div class="card card-block card-stretch card-height">
                <div class="card-body image-thumb">
                    <div class="mb-4 text-center p-3 rounded iq-thumb">
                        <div class="iq-image-overlay"></div>
                        <a href="#" id="xlsx-container" data-title="${file.metadata.name}" data-load-file="file" data-load-target="#resolte-contaniner" data-url="${file.metadata.path}" data-toggle="modal" data-target="#exampleModal"><img src="/assets/images/layouts/page-1/zip.png" class="img-fluid" alt="image1"></a>
                    </div>
                    <h6>${file.metadata.name}</h6>
                </div>
            </div>`;
                break;
            case 'exe':
                gridcard.innerHTML = `<div class="card card-block card-stretch card-height">
                <div class="card-body image-thumb">
                    <div class="mb-4 text-center p-3 rounded iq-thumb">
                        <div class="iq-image-overlay"></div>
                        <a href="#" id="xlsx-container" data-title="${file.metadata.name}" data-load-file="file" data-load-target="#resolte-contaniner" data-url="${file.metadata.path}" data-toggle="modal" data-target="#exampleModal"><img src="/assets/images/layouts/page-1/exe.png" class="img-fluid" alt="image1"></a>
                    </div>
                    <h6>${file.metadata.name}</h6>
                </div>
            </div>`;
                break;
            case 'mkv':
                gridcard.innerHTML = `<div class="card card-block card-stretch card-height">
                <div class="card-body image-thumb">
                    <div class="mb-4 text-center p-3 rounded iq-thumb">
                        <div class="iq-image-overlay"></div>
                        <a href="#" id="xlsx-container" data-title="${file.metadata.name}" data-load-file="file" data-load-target="#resolte-contaniner" data-url="${file.metadata.path}" data-toggle="modal" data-target="#exampleModal"><img src="/assets/images/layouts/page-1/media.png" class="img-fluid" alt="image1"></a>
                    </div>
                    <h6>${file.metadata.name}</h6>
                </div>
            </div>`;
            break;

            default:
                gridcard.innerHTML = `    <div class="card card-block card-stretch card-height">
                <div class="card-body image-thumb ">
                    <div class="mb-4 text-center p-3 rounded iq-thumb">
                        <a data-author="${file.createdBy}" data-title="${file.metadata.name}" class="image-popup-vertical-fit" href="${file.metadata.path}">
                            <img src="${file.metadata.path}" class="img-fluid" alt="images">
                            <div class="iq-image-overlay"></div>
                        </a>
                    </div>
                    <h6>${file.metadata.name}</h6>
                </div>
            </div>`;
                break;
        }

        // <div class="card card-block card-stretch card-height">
        //                 <div class="card-body image-thumb">
        //                     <div class="mb-4 text-center p-3 rounded iq-thumb">
        //                         <div class="iq-image-overlay"></div>
        //                         <a href="#" id="pdf-container" data-title="Mobile-plan.pdf" data-load-file="file" data-load-target="#resolte-contaniner" data-url="../assets/vendor/doc-viewer/files/demo.pdf" data-toggle="modal" data-target="#exampleModal"><img src="../assets/images/layouts/page-1/pdf.png" class="img-fluid" alt="image1"></a>
        //                     </div>
        //                     <h6>Mobile-plan.pdf</h6>
        //                 </div>
        //             </div>
        file_gridcard.appendChild(gridcard);
    }
}

// file related scripts

async function file_delete_functions(folder_id){
    if(fileflag){
        let filid  = Number.parseInt(fileid);
        if(filid!=undefined&&fileid!=null){
            if(await deleteFile(filid)){
                window.location.href = `/user/folder/${folder_id}`
            }
        }
    }
}

const file_share_function=(fid)=>{
    if (fileflag) {
    if (fid!=null||fid!=undefined) {
        let id  = Number.parseInt(fid);
       Swal.fire({
       title :"Share Settings",
       html:`<div class="">
           <form class="form form-horizontal" id="share_settings">
             <div class="form-body">
               <div class="row">
                 <div class="col-md-4">
                   <label>Share With : </label>
                 </div>
                 <div class="col-md-8 form-group">
                   <input type="text" id="first-name" class="form-control" name="sharewith" placeholder="user_names..">
                 </div>
                 <div class="col-md-4">
                   <label>Available  from : </label>
                 </div>
                 <div class="col-md-8 form-group">
                   <input type="time" id="email-id" class="form-control" name="available_time" placeholder="Email">
                 </div>
                 <div class="col-md-4">
                   <label>Available from : </label>
                 </div>
                 <div class="col-md-8 form-group">
                   <input type="date" id="contact-info" class="form-control" name="availabel_date" placeholder="Mobile">
                 </div>
                 <div class="col-md-4">
                   <label>Max Access Limit : </label>
                 </div>
                 <div class="col-md-8 form-group">
                   <input type="number" id="password" min="1" class="form-control" name="max_limit" placeholder="enter limit">
                 </div>
                 <div class="custom-control custom-switch">
                 <input type="checkbox" class="custom-control-input" name="make_public" id="mackepublic" >
                 <label class="custom-control-label" for="mackepublic">Make Public</label>
                 </div>
                 <div class="custom-control custom-switch">
                 <input type="checkbox" class="custom-control-input" name="unlimited_access" id="unlimited_access" >
                 <label class="custom-control-label" for="unlimited_access">unlimited access</label>
                 </div>
               </div>
             </div>
           </form>
         `,
         showCancelButton:true,
         confirmButtonText: 'Ok'
       }).then((result)=>{
            if (result.isConfirmed) {
                let form = document.querySelector("#share_settings");
                let formData = new FormData(form);
                let object = {};
                formData.forEach((val,key)=>{
                    object[key] = val;
                });
                console.log(object);
            }
       });
    }else{
        Swal.fire({
            text : "🐦☠🐦"
        });
    }
}
}

const manage_file_tags=(fileid,tags)=>{
    tags = tags.join(',');
    if (fileflag) {
        Swal.fire({
            title: 'Edit Tags',
            html:`<section>
            <input type="text" class="form form-control" value="${tags}" data-role="tagsinput"/>
            </section>`,
            showCancelButton: true,
            confirmButtonText: 'Save'
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire('Saved!', '', 'success')
            }
          })
    }
}

window.onload = async () => {
    update_sidebar();
    home_update_folders();
    load_files();
}