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
                            <i class="fa-solid fa-folder"></i>
                            </div>
                        </a>
                        <div class="card-header-toolbar">
                            <div class="dropdown">
                                <span class="dropdown-toggle" id="dropdownMenuButton2" data-toggle="dropdown">
                                <i class="fa-solid fa-bullseye"></i>
                                </span>
                                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton2">
                                    <a class="dropdown-item" href="#"><i class="fa-solid fa-eye"></i>View</a>
                                    <button onclick="deleteFolder(${data.id})" class="dropdown-item"><i class="fa-solid fa-trash"></i></button>
                                    <a class="dropdown-item" href="#"><i class="fa-solid fa-pen-to-square"></i>Edit</a>
                                    <a class="dropdown-item" href="#"><i class="fa-solid fa-print"></i>Print</a>
                                    <a class="dropdown-item" href="#"><i class="fa-solid fa-download"></i>Download</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <a href="" class="folder">
                        <h5 class="mb-2">${data.name}</h5>
                        <p class="mb-2"><i class="fa-solid fa-clock"></i>${new Date(data.createdAt).toDateString()}</p>
                        <p class="mb-0"><i class="fa-solid fa-file"></i> 0 Files</p>
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
            <i class="fa-solid fa-folder"></i><span>${val.name}</span>
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
                <a class="dropdown-item" href="/file/${file.id}"><i class="fa-solid fa-eye"></i>View</a>
                <button onclick="deleteFile(${file.id})" class="dropdown-item"><i class="fa-solid fa-trash"></i>Delete</button>
                <a class="dropdown-item" href="#"><i class="fa-solid fa-pen-to-square"></i>Edit</a>
                <a class="dropdown-item" href="#"><i class="fa-solid fa-print"></i>Print</a>
                <a class="dropdown-item" href="#"><i class="fa-solid fa-download"></i>Download</a>
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

async function file_delete_functions(folder_id) {
    if (fileflag) {
        let filid = Number.parseInt(fileid);
        if (filid != undefined && fileid != null) {
            if (await deleteFile(filid)) {
                window.location.href = `/user/folder/${folder_id}`
            }
        }
    }
}

const file_share_function = (fid) => {
    if (fileflag) {
        if (fid != null || fid != undefined) {
            let sharedata = file_share_settings.share_settings;
            if (sharedata == undefined) {
                sharedata = {
                    share_with: [],
                    is_public: false,
                    is_unlimited: false,
                    max_share_limit: 0,
                    available_date: "",
                    available_time: ""
                };
            }
            let uri = new URLSearchParams(window.location.href);
            let id = Number.parseInt(fid);
            Swal.fire({
                title: "Share Settings",
                html: `<div class="">
           <form class="form form-horizontal" id="share_settings">
             <div class="form-body">
               <div class="row">
                 <div class="col-md-4">
                   <label>Share With : </label>
                 </div>
                 <div class="col-md-8 form-group">
                   <input type="text" id="first-name" class="form-control" value="${sharedata.share_with.join(',')}" name="sharewith" placeholder="user_names..">
                 </div>
                 <div class="col-md-4">
                   <label>Available  at : </label>
                 </div>
                 <div class="col-md-8 form-group">
                   <input type="time" id="email-id" class="form-control" name="available_time" value="${sharedata.available_time}" placeholder="Email">
                 </div>
                 <div class="col-md-4">
                   <label>Available from : </label>
                 </div>
                 <div class="col-md-8 form-group">
                   <input type="date" id="contact-info" class="form-control" name="availabel_date" value="${sharedata.available_date}" placeholder="Mobile">
                 </div>
                 <div class="col-md-4">
                   <label>Max Access Limit : </label>
                 </div>
                 <div class="col-md-8 form-group">
                   <input type="number" id="password" min="1" class="form-control" name="max_limit" value="${sharedata.max_share_limit}" placeholder="enter limit">
                 </div>
                 <div class="custom-control custom-switch">
                 <input type="checkbox" class="custom-control-input" name="make_public" id="mackepublic" ${sharedata.is_public ? 'checked' : ''}>
                 <label class="custom-control-label" for="mackepublic">Make Public</label>
                 </div>
                 <div class="custom-control custom-switch">
                 <input type="checkbox" class="custom-control-input" name="unlimited_access" id="unlimited_access" ${sharedata.is_unlimited ? 'checked' : ''}>
                 <label class="custom-control-label" for="unlimited_access">unlimited access</label>
                 </div>
               </div>
             </div>
             <input type="text" class="form form-control-sm w-100" value="${window.location.protocol + "://" + window.location.host + "/share/file/" + fid}" id="filelink">
           </form>
         `,
                showCancelButton: true,
                confirmButtonText: 'Ok'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    let form = document.querySelector("#share_settings");
                    let formData = new FormData(form);
                    let object = {};
                    formData.forEach((val, key) => {
                        object[key] = val;
                    });
                    let config = {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(object)
                    }
                    let res = await handleRequest(`/permission/${fid}/fmdata`, config, 201);
                    if (res == null) {
                        config.method = 'PATCH';
                        res = await handleRequest(`/permission/${fid}/fmdata`, config, 200);
                        if (res == null) {
                            notifier.alert("Not able to update..");
                        } else {
                            file_share_settings = res;
                            notifier.success("Updated..");
                        }
                    } else {
                        file_share_settings = res;
                        notifier.success("Updated..");

                    }
                }
            });
        } else {
            Swal.fire({
                text: "🐦☠🐦"
            });
        }
    }
}

const manage_file_tags = (fileid, tags) => {
    tags = tags.join(',');
    if (fileflag) {
        Swal.fire({
            title: 'Edit Tags',
            html: `<section>
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

const generate_file_timeline = (filemname) => {
    if (fileflag) {
        if (filemname == undefined) {
            notifier.alert("something went worng..");
        }
    }
}

const encrypt_file = async (fid) => {
    let encalgos = await handleRequest('/master/filter?type=encryption_algorithms', { method: 'GET' }, 200);
    if (fileflag) {
        if (fileid == fid) {
            let encswitch = document.querySelector("#encryptswitch");
            // if (encswitch.checked) {
            Swal.fire({
                title: "Enrypt a file",
                html: `<form id="encform">
                    <div class="form-group">
                      <label for="algo">Choose Algorithm</label>
                      <select class="form-control" id="algo" aria-describedby="algoHelp" name="algo">
                                <option class="form-text" value="-1">select algorithm</option>
                      </select>
                      <small id="algoHelp" class="form-text text-muted">Ex AES,DES etc</small>
                    </div>
                   <!-- <div class="form-group form-check">
                      <input type="checkbox" class="form-check-input" name="saveonserver" id="enconsrv" checked>
                      <label class="form-check-label" for="enconsrv">encrypt file on server</label>
                    </div>-->
                  </form>`,
                showCancelButton: true,
                cancelButtonText: "cancle",
                allowOutsideClick: false
            }).then(async (res) => {
                if (res.isConfirmed) {
                    let objx = { "saveonserver": true, "algo": -1 }
                    let formdata = document.querySelector("#encform");
                    let form = new FormData(formdata);
                    let tmp = {};
                    for (let obj of form.entries()) {
                        tmp[obj[0]] = obj[1];
                    }
                    objx.algo = tmp.algo;
                    objx.saveonserver = tmp.saveonserver == null ? false : true;
                    if (objx.algo == -1) {
                        return alert("select atleast one algorithm 🐦");
                    }
                    let url = `/file/${fid}/crypto?action=encrypt&algo=${objx.algo}&saveonserver=${objx.saveonserver}`;
                    let notifier = new AWN("encrypting file", {
                        icons: {
                            enabled: false,
                            prefix: '<i class="las la-check-double',
                            suffix: '></i>'
                        }
                    });
                    notifier.async(fetch(url, {
                        method: "GET", headers: {
                            "Accept": "*/*"
                        }
                    }), async (resp) => {
                        if (resp.status != 200) {
                            let errx = (await resp.json()).errmsg;
                            notifier.alert(`${errx}`);
                        } else {
                            notifier.success("file keys related mail has been sent to you..")
                            resp.json().then((resx) => {
                                // console.log(resx);
                                let fname = resx.file_name;
                                // const file = new File([resx.data], fname, { type: "application/octact-stream" });
                                // const downloadLink = document.createElement('a');
                                // downloadLink.href = URL.createObjectURL(file);
                                // downloadLink.download = fname; // Set the desired filename and extension
                                // downloadLink.textContent = 'Download encrpted File';

                                // document.body.appendChild(downloadLink);

                                // // Clean up after the download link is clicked or no longer needed
                                // downloadLink.addEventListener('click', () => {
                                //     //   URL.revokeObjectURL(blobUrl);
                                //     document.body.removeChild(downloadLink);
                                // });
                                // downloadLink.click();

                                const byteCharacters = atob(resx.data);
                                const byteNumbers = new Array(byteCharacters.length);
                                for (let i = 0; i < byteCharacters.length; i++) {
                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                }
                                const byteArray = new Uint8Array(byteNumbers);
                                const blob = new Blob([byteArray], { type: 'application/octet-stream' }); // Adjust the MIME type as needed

                                const blobUrl = URL.createObjectURL(blob);

                                const a = document.createElement('a');
                                a.style.display = 'none';
                                document.body.appendChild(a);
                                a.href = blobUrl;
                                a.download = fname;
                                a.click();
                                URL.revokeObjectURL(blobUrl);
                            });
                        }
                    });
                } else {
                }
            });
            for (let algo of encalgos) {
                let opt = document.createElement("option");
                opt.setAttribute("value", algo.key);
                opt.innerText = algo.value;
                document.querySelector("#algo").appendChild(opt);
            }
            // } else {
            //     Swal.fire("decrypting");
            // }
        }
    }
}

async function decryptFile() {
    let encalgos = await handleRequest('/master/filter?type=encryption_algorithms', { method: 'GET' }, 200);
    Swal.fire({
        title: "File Decryptor",
        html: `<section>
        <form id="decryptform" enctype="multipart/form-data">
  <div class="mb-3">
    <label for="dcfile" class="form-label">Encrpted file</label>
    <input type="file" name="encrypted_file" class="form-control" id="dcfile" aria-describedby="dcfilehelp">
    <div id="dcfilehelp" class="form-text">with extension .enc</div>
  </div>
  <div class="mb-3">
    <label for="algo" class="form-label">Encryption algorithm</label>
    <select class="form-control" id="algo" aria-describedby="algoHelp" name="algo">
    <option class="form-text" value="-1">select algorithm</option>
</select>
  </div>
  <div class="mb-3">
  <label for="ogname" class="form-label">orignal filename</label>
  <input type="text" name="ogname" class="form-control" id="ogname">
</div>
  <div class="mb-3">
    <label for="enckey" class="form-label">Encryption Key</label>
    <input type="text" name="key" class="form-control" id="enckey">
  </div>
  
  <div class="mb-3">
    <label for="enciv" class="form-label">Encyption iv</label>
    <input type="text" name="iv" class="form-control" id="enciv">
  </div>
  <div class="form-text">details is sended via email..</div>
</form>
        </section>`,
        allowOutsideClick: false,
        showCancelButton: true
    }).then(async (res) => {
        if (res.isConfirmed) {
            let form = document.querySelector("#decryptform");
            // let res = await 
            let notifier = new AWN("encrypting file", {
                icons: {
                    enabled: false,
                    prefix: '<i class="las la-check-double',
                    suffix: '></i>'
                }
            });
            notifier.async(fetch("/file/crypto", {
                method: "POST",
                body: new FormData(form)
            }), async (resp) => {
                if (resp.status != 200) {
                    let errx = (await resp.json()).errmsg;
                    notifier.alert(`${errx}`);
                } else {
                    notifier.success("file decrpted..");
                    resp.json().then((resx) => {
                        let fname = resx.file_name;
                        const byteCharacters = atob(resx.data);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: 'application/octet-stream' }); // Adjust the MIME type as needed

                        const blobUrl = URL.createObjectURL(blob);

                        const a = document.createElement('a');
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.href = blobUrl;
                        a.download = fname;
                        a.click();
                        URL.revokeObjectURL(blobUrl);
                    });
                }
            });

        }
    })
    for (let algo of encalgos) {
        let opt = document.createElement("option");
        opt.setAttribute("value", algo.key);
        opt.innerText = algo.value;
        document.querySelector("#algo").appendChild(opt);
    }
}

const start_live_share = (id) => {
    if (fileflag) {
        if (id == undefined) {
            alert("noob")
        }
        else {
            id = Number.parseInt(id);
            Swal.fire(typeof id);
        }
    }
}
var socket;
function live_share() {
    if (liveshare != null && liveshare) {
        socket = io("/file/share/live");
        console.log(socket);
        socket.on("file-download", (data) => {
            download_live_file(data.name, data.data, data.type);
        });
        socket.on("recieve-message", (data) => {
            handle_incoming_live_file_message(data.user, data.msg);
        });

        let i = 1;
        setInterval(() => {
            if (i == 1) {
                document.title = "MaxDrive |🧨 live share 🐦"
            } else {
                document.title = "MaxDrive |🐦 live share 🧨"
            }
            i += 1;
            i %= 2;
        }, 1000)
    }
}

let roomid;
function join_file_share_room() {
    let joineduser = document.querySelector("#joineduser");
    roomid = Number.parseInt(document.querySelector("#roomid").value);
    socket.emit("join-room", {
        id: roomid,
        user: user_name
    });

    document.querySelector("#comms").innerHTML = "";
    document.querySelector("#comms").innerHTML = `  <img src="/assets/images/dark-loader.gif" class="card-img-top" style="width: 250px;height: 30px;" alt="...">`;
    document.querySelector("#roomtext").innerHTML = `Connections(room#${roomid})`;
    socket.on("user-joined", (data) => {
        joineduser.innerHTML = "";
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            let li = document.createElement("li");
            li.setAttribute("class", "list-group-item");
            li.innerHTML = element;
            joineduser.appendChild(li);
        }

    })

}

function add_live_file_queue() {
    let rows = document.querySelector("#filerows");
    let id = 'file-' + Number.parseInt(100 * Math.random());
    let tr = document.createElement("tr");
    tr.setAttribute("id", id);
    tr.innerHTML = ` <th scope="row">${id}</th>`;
    let fip = document.createElement("input");
    fip.setAttribute("type", "file");
    fip.setAttribute("required", "");
    fip.setAttribute("class", "queue-file");
    fip.setAttribute("name", id);
    fip.click();
    tr.appendChild(fip);
    let act = document.createElement("td");
    act.innerHTML = `<button class="btn btn-sm btn-danger" onclick="remove_file_from_queue('${id}')">Delete</button>&nbsp;&nbsp;<button class="btn btn-sm btn-success" onclick="send_one_live_file('${id}')">Send</button>`;
    tr.appendChild(act);
    rows.appendChild(tr);
}

function remove_file_from_queue(id) {
    document.getElementById(id).remove();
}

function send_queued_file() {
    let files = document.getElementsByClassName("queue-file");
    Array.from(files).forEach((file) => {
        if (file.files.length > 0) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const fileData = e.target.result;
                const fileName = file.files[0].name;
                const type = file.files[0].type;

                socket.emit('file-upload', { id: roomid, data: fileData, name: fileName, type: type });
            };
            reader.readAsArrayBuffer(file.files[0]);
        }
    })

}

function download_live_file(name, data, type) {
    console.log(name, data, type);
    const blob = new Blob([data], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function send_live_file_message() {
    let text = document.querySelector("#chatip").value;
    if (text == "" || text == null || text == undefined) {
        return;
    }
    socket.emit("send-message", {
        id: roomid,
        msg: text,
        user: user_name
    });
    handle_incoming_live_file_message(user_name, text)
}

function handle_incoming_live_file_message(user, message) {
    let chats = document.querySelector("#chats");
    let div = document.createElement("div");
    div.setAttribute("class", "mb-3 row bg-primary my-3");
    div.setAttribute("style", "border-radius: 15px;");
    div.innerHTML = `<marquee class="col-sm-2 col-form-label">${user}</marquee>
    <div class="col-sm-10">
      <input type="text" readonly class="form-control-plaintext"  value="${message}">
    </div>`;
    chats.appendChild(div);
}

function send_one_live_file(id) {
    let file = document.getElementsByName(id)[0];

    const reader = new FileReader();

    reader.onload = (e) => {
        const fileData = e.target.result;
        const fileName = file.files[0].name;
        const type = file.files[0].type;

        socket.emit('file-upload', { id: roomid, data: fileData, name: fileName, type: type });
    };
    reader.readAsArrayBuffer(file.files[0]);
}

function createComment(username, text) {
    var commentElement = document.createElement("div");
    commentElement.setAttribute("class", "alert alert-secondary mt-3");
    commentElement.innerHTML = `${username} : ${text}`;

    // Create a reply button for this comment
    var replyButton = document.createElement("button");
    replyButton.setAttribute("class", "btn btn-primary btn-sm ml-2 replyBtn");
    replyButton.innerHTML = "Reply";
    commentElement.append(replyButton);

    // Create a container for nested replies
    var replyContainer = document.createElement("div");
    // replyContainer.setAttribute("class","ml-4 mt-2");
    commentElement.append(replyContainer);
    commentElement.append(document.createElement("br"));
    // Event handler for replying to a comment
    replyButton.addEventListener("click", function () {
        var replyUsername = prompt("Enter your username:");
        var replyText = prompt("Reply to this comment:");
        if (replyUsername && replyText) {
            // Create a nested reply element
            var replyElement = createComment(replyUsername, replyText);
            replyContainer.append(replyElement);
        }
    });

    return commentElement;
}

async function load_public_media(from, limit) {

    let medias = document.querySelector("#medias");
    let load = medias.lastChild;
    medias.lastChild.remove();
    if (explore_view) {
        let res = await handleRequest(`/explore/data?from=${from}&limit=${limit}`, {
            method: "GET"
        }, 200);
        if (res == null) {
            return;
        }
        res.forEach((val) => {
            let card = document.createElement("div");
            card.setAttribute("class", "col-lg-10 col-md-6");
            try {
                card.innerHTML = `<div class="card col-lg-10 col-sm-7 col-md-7">
                <div class="card-header">
                ${val.createdBy} Shared publicaly at : ${new Date(val.updatedAt).toDateString()}
       </div>
           <div class="card-body">
           <img src="${val.metadata.path}" class="card-img-top" alt="#" onerror="this.remove()">
           <video src="${val.metadata.path}" class="img-fluid rounded" alt="#" controls onerror="this.remove()"></video>
               <h4 class="card-title">${val.metadata.name}</h4>
               <p class="card-text"><small class="text-muted">Updated at :${new Date(val.createdAt).toDateString()}</small></p>
               <div class="d-flex flex-row fs-12">
               <button class="btn btn-sm btn-outline-success like p-2 cursor mx-2"><i class="fa-solid fa-thumbs-up"></i><span class="ml-1">Like</span></button>
               <button class="btn btn-sm btn-outline-danger like p-2 cursor mx-2"><i class="fa-solid fa-thumbs-down"></i><span class="ml-1">Dislike</span></button>
               <button class="btn btn-sm btn-outline-info like p-2 cursor mx-2"><i class="fa-solid fa-comment"></i><span class="ml-1">Comment</span></button>
               <button class="btn btn-sm btn-outline-primary like p-2 cursor mx-2"><i class="fa-solid fa-share"></i><span class="ml-1">Share</span></button>
           </div>
            </div>
         </div>`;

                var commentsSection = document.createElement("div");
                commentsSection.setAttribute("class", "comments");
                card.append(commentsSection);

                // Create input fields for adding comments
                var usernameInput = document.createElement("input");
                usernameInput.setAttribute("class", "form-control");
                usernameInput.setAttribute("placeholder", "Enter your username");
                var commentInput = document.createElement("textarea");
                commentInput.setAttribute("class", "form-control");
                commentInput.setAttribute("rows", "3");
                commentInput.setAttribute("placeholder", "Add a comment");
                var submitButton = document.createElement("button");
                submitButton.setAttribute("class", "btn btn-primary");
                submitButton.innerHTML = `Submit`;


                // Event handler for adding a comment
                submitButton.addEventListener("click", function () {
                    var username = usernameInput.value;
                    var commentText = commentInput.value;
                    if (username.trim() === "" || commentText.trim() === "") {
                        alert("Please enter both a username and a comment.");
                    } else {
                        // Create a new comment element for this card
                        var commentElement = createComment(username, commentText);

                        // Append the comment to the comments section
                        commentsSection.append(commentElement);

                        // Clear the input fields
                        usernameInput.value = "";
                        commentInput.value = "";
                    }
                });

                // Append input fields and submit button to the card
                // card.append("<div class='form-group'><label>Username:</label></div>");
                card.append(usernameInput);
                // card.append("<div class='form-group'><label>Comment:</label></div>");
                card.append(commentInput);
                card.append(submitButton);

            } catch (error) {
                console.log(error.message);
            }
            medias.appendChild(card);
        });
        medias.append(load);
    }
}

async function load_analytics_file() {
    if (index_page) {
        let data = await handleRequest("/analytics/files", { method: "GET" }, 200);
        if (data == null) return;
        let tbody = document.querySelector("#analytics_file");
        if (tbody == null) return;
        for(let file of data) {
            let ext  = file.name.split('.');
            ext = ext[ext.length-1];
            console.log(ext);
            let theme  = "success";
            let icon = `<i class="fa-solid fa-file"></i>`;
            switch (ext) {
                case 'pptx':
                    theme = "info";
                   icon = `<i class="fa-solid fa-p"></i>`;
                    break;
                case 'pdf':
                    theme = "danger";
                    icon = `<i class="fa-solid fa-file"></i>`;
                    break;
                case 'xlsx':
                    theme = "success";
                    icon = `<i class="fa-solid fa-file"></i>`;
                    break;
                case 'docx':
                    theme = "primary";
                    icon = `<i class="fa-solid fa-file"></i>`;
                    break;
                case 'msi':
                    theme = "secondary";
                    icon = `<i class="fa-solid fa-file"></i>`;
                    break;
                case 'zip':
                    theme = "secondary";
                    icon = `<i class="fa-solid fa-file"></i>`;
                    break;
                case 'exe':
                    theme = "secondary";
                    icon = `<i class="fa-solid fa-file"></i>`;
                    break;
                case 'mkv':
                    theme = "info";
                    icon = `<i class="fa-solid fa-file"></i>`;
                    break;
                default:
                    theme = "secondary";
                    icon = `<i class="fa-solid fa-file"></i>`;
                    break;
            }

          let tr  = document.createElement("tr");
          tr.innerHTML=`<td>
          <div class="d-flex align-items-center">
              <div class="icon-small bg-${theme} rounded mr-3">
                  ${icon}
              </div>
              <div data-load-file="file" data-load-target="#resolte-contaniner" data-url="${file.path}" data-toggle="modal" data-target="#exampleModal" data-title="${file.name}" style="cursor: pointer;"><marquee>${file.name}</marquee></div>
          </div>
      </td>
      <td>${file.author}</td>
      <td><marquee>${new Date(file.lastedit).toDateString()} ${file.editor}</marquee></td>
      <td>${(file.size/1024/1024).toFixed(3)} MB</td>
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
        }
    }
}

// utils
function util_extract_json_from_formdata(formData) {

}

window.onload = async () => {
    try {
        update_sidebar();
    } catch (error) {

    }
    try {
        home_update_folders();
    } catch (error) {

    }
    try {
        load_files();
    } catch (error) {

    }
    try {
        await load_public_media(0, 1)
    } catch (error) {

    }
    try {
        await live_share();
    } catch (error) {

    }
    await load_analytics_file()
}
let isLoading = false, from = 0;
window.addEventListener('scroll', async () => {
    if (isLoading) return;

    // Check if the user is near the bottom of the page
    if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
    ) {
        isLoading = true;
        await load_public_media(from + 1, 1);
        from = from + 1;
        isLoading = false;
    }
}
);