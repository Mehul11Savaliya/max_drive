let notifier = new AWN({
    icons: {
        enabled: false,
        prefix: '<i class="las la-check-double',
        suffix: '></i>'
    }
});

try {
    index_page = index_page
} catch (error) {
    index_page = false;
}

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

async function deleteFile(id, event) {
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
            // console.log(res);
            if (res.status != 204) {
                notifier.alert("file not deleted..");
            } else {
                notifier.success("file deleted..");
                try {
                    rowcd.remove();
                    gridcd.remove();
                } catch (error) {
                }
                try {
                    document.getElementById(`row-${id}`).remove();
                    this.draw();
                } catch (error) {
                    console.log(error);
                }
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
                                    <a class="dropdown-item" href="/user/folder/${data.id}"><i class="fa-solid fa-eye"></i>View</a>
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
                        <p class="mb-0"><i class="fa-solid fa-file"></i> ${data.count} Files</p>
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
    let folderlist = [];
    let folderlists = '';
    if (index_page) {
        folderlist = await handleRequest("/folder", { method: "GET" }, 200);
        for (const folder of folderlist) {
            folderlists += `<option value="${folder.id}">${folder.name}</option>`;
        }
    }
    Swal.fire({
        title: 'upload file',
        html: `
        <form id="filestoupload" enctype="multipart/form-data">
        <div class="row" id="fm-wizard-holder"></div>
        <div class="col-lg-12 col-md-8 col-sm-11">
        ${(index_page ? `<select class="form form-control" name="folder">
        <option selected value="-1">Select Folder</option>
        ${folderlists}
         </select>`: "")}
        </div>
        </form>
        <div class="row">
        <div class="col-lg-4 col-md-8 col-sm-11">
        <button class="btn btn-primary" onclick="generateWizardCard(event)">Add media</button>
        </div>
        </div>
        <br>
        <div class="prog-container" style="display:none">
        <progress style="width:100%" id="uploadp" value="0" max="100"></progress><br>
        <span id="uploadpercp">0%</span><br>
        <span id="uploadspeed">0 KB/s</span><br>
        <span id="remainingTime">Calculating...</span>
        </div>`,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'save',
        confirmButtonAriaLabel: 'save',
        cancelButtonText: 'cancel',
        cancelButtonAriaLabel: 'cancel',
        preConfirm: () => {
            return new Promise((reslv, rej) => {
                const container = Swal.getHtmlContainer().querySelector('.prog-container');
                const progressBar = Swal.getHtmlContainer().querySelector('#uploadp');
                const progressText = Swal.getHtmlContainer().querySelector('#uploadpercp');
                const speedText = Swal.getHtmlContainer().querySelector('#uploadspeed');
                const remtime = Swal.getHtmlContainer().querySelector('#remainingTime');
                const startTime = Date.now();
                container.style.display = 'block';
                let notifier = new AWN({
                    icons: {
                        enabled: false,
                        prefix: '<i class="las la-check-double',
                        suffix: '></i>'
                    }
                });

                let url = document.location.href;
                let folder_id = url.split('/');
                folder_id = folder_id[folder_id.length - 1];
                folder_id = Number.parseInt(folder_id.trim().replaceAll('?', '').replaceAll('#', ''));

                let formData = new FormData(document.querySelector("#filestoupload"));
                if (formData.get("folder") == null || formData.get("folder") == -1) {
                    formData.append("folder", folder_id);
                }

                const xhr = new XMLHttpRequest();
                xhr.open("POST", "/file/", true);
                xhr.setRequestHeader("Accept", "application/json");
                xhr.responseType = "json";
                xhr.upload.onprogress = function (e) {
                    if (e.lengthComputable) {
                        const loaded = e.loaded;
                        const total = e.total;
                        const percent = (loaded / total) * 100;

                        // Calculate remaining time
                        const currentTime = Date.now();
                        const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
                        const remainingBytes = total - loaded;
                        const uploadSpeedBps = loaded / elapsedTime; // Bytes per second
                        const uploadSpeedKbps = uploadSpeedBps * 8 / 1000; // Kilobits per second
                        const remainingTime = remainingBytes / uploadSpeedBps; // Seconds

                        // Update progress bar and text
                        progressBar.value = percent;
                        progressText.textContent = percent.toFixed(2) + '%';

                        // Update speed text
                        speedText.textContent = uploadSpeedKbps.toFixed(2) + ' kbps';

                        // Calculate and display remaining time
                        const minutes = Math.floor(remainingTime / 60);
                        const seconds = Math.floor(remainingTime % 60);
                        remtime.textContent = `Remaining Time: ${minutes}:${seconds}`;
                    }
                }
                xhr.send(formData);
                xhr.onreadystatechange = async function (ev) {
                    if (xhr.status != 201) {
                        notifier.alert(`error in uploading (${xhr.statusText})`);
                    } else {
                        let resp = xhr.response;
                        if (!index_page) {
                            let config = {
                                method: "GET"
                            }
                            let folder_id = url.split('/');
                            folder_id = folder_id[folder_id.length - 1];
                            folder_id = Number.parseInt(folder_id.trim().replaceAll('?', '').replaceAll('#', ''));
                            let ress = await handleRequest(`/file/all?folder=${folder_id}`, config, 200);
                            generate_folder_file_cards(ress);
                            notifier.success(`${resp.length} files has been loaded`)
                            reslv();
                        } else {
                            notifier.success(`${resp.length} files has been loaded`)
                            reslv();
                        }
                    }
                }
            });
        }
    }).then(async (res) => {
        if (res.isConfirmed) {
        }
    });
}

async function upload_folder() {
    Swal.fire({
        title: 'upload folder',
        html: `
        <form id="foldertoupload" enctype="multipart/form-data">
        <div class="row" id="fm-wizard-holder"></div>
        <input class="form form-control" type="file" name="folder" id="folderInput" webkitdirectory directory multiple>
        <br>
        <input class="form form-control" placeholder="Enter folder name" type="text" name="folder_name" id="" required>
        </div>
        </form>
        <br>
        <div class="prog-container" style="display:none">
        <progress style="width:100%" id="uploadp" value="0" max="100"></progress><br>
        <span id="uploadpercp">0%</span><br>
        <span id="uploadspeed">0 KB/s</span><br>
        <span id="remainingTime">Calculating...</span>
        </div>`,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'save',
        confirmButtonAriaLabel: 'save',
        cancelButtonText: 'cancel',
        cancelButtonAriaLabel: 'cancel',
        preConfirm: () => {
            return new Promise((reslv, rej) => {
                const container = Swal.getHtmlContainer().querySelector('.prog-container');
                const progressBar = Swal.getHtmlContainer().querySelector('#uploadp');
                const progressText = Swal.getHtmlContainer().querySelector('#uploadpercp');
                const speedText = Swal.getHtmlContainer().querySelector('#uploadspeed');
                const remtime = Swal.getHtmlContainer().querySelector('#remainingTime');
                const startTime = Date.now();
                container.style.display = 'block';
                let notifier = new AWN({
                    icons: {
                        enabled: false,
                        prefix: '<i class="las la-check-double',
                        suffix: '></i>'
                    }
                });

                let formData = new FormData(document.querySelector("#foldertoupload"));
                const xhr = new XMLHttpRequest();
                xhr.open("POST", "/folder/bulk", true);
                xhr.setRequestHeader("Accept", "application/json");
                xhr.responseType = "json";
                xhr.upload.onprogress = function (e) {
                    if (e.lengthComputable) {
                        const loaded = e.loaded;
                        const total = e.total;
                        const percent = (loaded / total) * 100;

                        // Calculate remaining time
                        const currentTime = Date.now();
                        const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
                        const remainingBytes = total - loaded;
                        const uploadSpeedBps = loaded / elapsedTime; // Bytes per second
                        const uploadSpeedKbps = uploadSpeedBps * 8 / 1000; // Kilobits per second
                        const remainingTime = remainingBytes / uploadSpeedBps; // Seconds

                        // Update progress bar and text
                        progressBar.value = percent;
                        progressText.textContent = percent.toFixed(2) + '%';

                        // Update speed text
                        speedText.textContent = uploadSpeedKbps.toFixed(2) + ' kbps';

                        // Calculate and display remaining time
                        const minutes = Math.floor(remainingTime / 60);
                        const seconds = Math.floor(remainingTime % 60);
                        remtime.textContent = `Remaining Time: ${minutes}:${seconds}`;
                    }
                }
                xhr.send(formData);
                xhr.onreadystatechange = async function (ev) {
                    if (xhr.status != 201) {
                        notifier.alert(`error in uploading (${xhr.statusText})`);
                    } else {
                        let resp = xhr.response;
                        if (index_page != true) {
                            let config = {
                                method: "GET"
                            }
                            let folder_id = url.split('/');
                            folder_id = folder_id[folder_id.length - 1];
                            folder_id = Number.parseInt(folder_id.trim().replaceAll('?', '').replaceAll('#', ''));
                            let ress = await handleRequest(`/file/all?folder=${folder_id}`, config, 200);
                            generate_folder_file_cards(ress);
                            notifier.success(`${resp.length} files has been loaded`)
                            reslv();
                        } else {
                            notifier.success(`${resp.name} folder has been created`);
                            try {
                                await home_update_folders();
                            } catch (error) {

                            }
                            try {
                                await update_sidebar();
                            } catch (error) {

                            }
                            reslv();
                        }
                    }
                }
            });
        }
    }).then(async (res) => {
        if (res.isConfirmed) {
        }
    });
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
    try {
        folder_page = folder_page;
    } catch (error) {
        folder_page = false;
    }
    if (folder_page) {
        let btn = document.querySelector('body > div.content-page > div > div.row > div > div > div.d-flex.align-items-center > div.list-grid-toggle.mr-4 > span.icon.i-grid.icon-grid > i');

        setTimeout(() => {
            btn.click();
        }, 700);

        let config = {
            method: "GET"
        }
        let ress = await handleRequest(`/file/all?folder=${Number.parseInt(folder_id)}`, config, 200);
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
                if (file.metadata.mimetype.split("/")[0] == "image") {
                    thumdimg = `/file/${file.id}/content?type=thumb`;
                }
                break;
        }
        tr.innerHTML = `<td>
        <div class="d-flex align-items-center">
            <div class="mr-3">
                <a href="/file/${file.id}"><img src="${thumdimg}" class="img-fluid avatar-30" alt="image1"></a>
            </div>
            ${file.metadata.name}
        </div>
        <div class="row d-flex" id="dctrl-${file.id}"></div>
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
                <button onclick="file_download_functions_live(${file.id},'${file.metadata.name}')" class="dropdown-item"><i class="fa-solid fa-download"></i>Download</button>
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
                        <a data-author="${file.createdBy}" data-title="${file.metadata.name}" class="image-popup-vertical-fit" href="/file/${file.id}/content?type=thumb">
                            <img src="/file/${file.id}/content?type=thumb" class="img-fluid" alt="images">
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

//folder related function
//by permission route
async function folder_edit(id) {
    if (folder_page) {
        if (folder_id != null) {
            folder_id = Number.parseInt(folder_id);
            if (!isNaN(folder_id)) {
                let folder_data = await handleRequest(`/permission/folder/${id}/shardata`, { method: "GET" }, 200);
                let sharedata = folder_data.data.share_settings;
                if (Object.keys(sharedata).length === 0) {
                    sharedata = undefined;
                }
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
                Swal.fire({
                    title: `Folder Share Setttings`,
                    html: `
                <form class="form form-horizontal" id="folder_share_settings">
               <div class="row">
                 <div class="col-md-4">
                   <label>Share With : </label>
                 </div>
                 <div class="col-md-8 form-group">
                   <input type="text" id="first-name" class="form-control" value="${sharedata.share_with != undefined ? sharedata.share_with.join(',') : ''}" name="share_with" placeholder="user_names..">
                 </div>
                 <div class="col-md-4">
                   <label>Available  at : </label>
                 </div>
                 <div class="col-md-8 form-group">
                   <input type="time" id="availtime" class="form-control" name="available_time" value="${sharedata.available_time}" placeholder="Enter time">
                 </div>
                 <div class="col-md-4">
                   <label>Available from : </label>
                 </div>
                 <div class="col-md-8 form-group">
                   <input type="date" id="date-info" class="form-control" name="available_date" value="${sharedata.available_date}" placeholder="date">
                 </div>
                 <div class="col-md-4">
                   <label>Max Access Limit : </label>
                 </div>
                 <div class="col-md-8 form-group">
                   <input type="number" id="accesslimit" min="1" class="form-control" name="max_share_limit" value="${sharedata.max_share_limit}" placeholder="enter limit">
                 </div>
                 <div class="custom-control custom-switch">
                 <input type="checkbox" class="custom-control-input" name="is_public" id="mackepublic" ${sharedata.is_public ? 'checked' : ''} >
                 <label class="custom-control-label" for="mackepublic">Make Public</label>
                 </div>
                 <div class="custom-control custom-switch">
                 <input type="checkbox" class="custom-control-input" name="is_unlimited" id="unlimited_access" ${sharedata.is_unlimited ? 'checked' : ''}>
                 <label class="custom-control-label" for="unlimited_access">unlimited access</label>
                 </div>
               </div>
             <input type="text" class="form form-control-sm w-100" value="${window.location.protocol}${window.location.host}/share/folder/${Number.parseInt(folder_id)}" id="filelink">
           </form>
                `,
                    showCloseButton: true,
                    showCancelButton: true,
                    focusConfirm: false, cancelButtonText: 'cancel',
                    cancelButtonAriaLabel: 'cancel',
                }).then(async (res) => {
                    if (res.isConfirmed) {
                        let updatedata = new FormData(document.querySelector("#folder_share_settings"));
                        // let obj = {
                        //     "name": "<%-data.folder.name-%>",
                        //     "sharewith": "",
                        //     "available_time": "",
                        //     "availabel_date": "",
                        //     "max_limit": "",
                        //     "make_public": "",
                        //     "unlimited_access": ""
                        // };
                        let obj = { share_settings: {} };
                        updatedata.forEach((val, key) => {
                            obj.share_settings[key] = val;
                        });

                        let res = await handleRequest(`/permission/folder/${id}/shardata`, {
                            method: "PATCH",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(obj)
                        }, 200);
                        if (res == null) {
                            notifier.alert("not updated..")
                        }
                        else {
                            notifier.success("updaed..")
                        }
                    }
                })
            }
        }
    }
    // body:JSON.stringify({
    //     share_settings:obj})
}

async function folder_update(id, datax) {
    if (folder_page) {
        if (id != null) {
            id = Number.parseInt(id);
            if (!isNaN(id)) {
                let data = await handleRequest(`/folder/${id}`, {
                    method: "PATCH",
                    headers: {
                        'Content-Type': "application/json"
                    },
                    body: JSON.stringify(datax)
                }, 200);
                if (data == null) {
                    notifier.alert("not able to update")
                }
            }
        }
    }
}

async function folder_edit2(id) {
    if (folder_page) {
        if (id != null) {
            id = Number.parseInt(id);
            Swal.fire({
                title: 'Folder Edit',
                html: `
                <form class="row" id="fedit">
                <div class="col-md-4">
                <label>name : </label>
              </div>
              <div class="col-md-8 form-group">
                <input type="text" id="" class="form-control" value="${folder_name}" name="name" placeholder="folder name.">
              </div>
              <div class="col-md-4">
              <label>Password : </label>
            </div>
            <div class="col-md-8 form-group">
              <input type="password" id="" class="form-control" value="${folder_pass}" name="password" placeholder="folder password.">
            </div>
            </form>
                `,
                showCancelButton: true
            }).then(async (res) => {
                if (res.isConfirmed) {
                    let form = new FormData(document.querySelector("#fedit"));
                    let obj = {};
                    form.forEach((val, key) => {
                        obj[key] = val;
                    });
                    folder_pass = obj.password;
                    folder_name = obj.name;
                    await folder_update(id, obj);
                }
            })
        }
    }
}

async function folder_gen_timeline(folderid) {
    if (folder_page) {
        if (folderid == undefined) {
            notifier.alert("something went worng..");
        } else {
            folderid = Number.parseInt(folderid);
            let resx = await handleRequest(`/analytics/folder/${folderid}/audit`, { method: "GET" }, 200);
            resx = resx.map((val) => {
                return {
                    date: `${new Date(val.time).toDateString()}`,
                    content: `accessed by <br> ${val.user} \n<br> msg :<span style="color:red"> ${val.message == undefined ? "" : val.message}</span>`
                }
            });
            document.querySelector("#folder-timeline").scrollIntoView();
            document.querySelector("#folder-timeline").innerHTML = `<h5>Time Line</h5>`;
            // window.scrollTo(0,document.querySelector("#folder-timeline").scrollY+50);
            $('#folder-timeline').roadmap(resx, {
                eventsPerSlide: 10,
                prevArrow: '<i class="fa-solid fa-arrow-left"></i>',
                nextArrow: '<i class="fa-solid fa-arrow-right"></i>'
            });

        }
    }
}

// file related scripts
try {
    fileflag = fileflag;
} catch (error) {
    fileflag = false;
}
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

const file_share_function = async (fid) => {
    if (fileflag) {
        if (fid != null || fid != undefined) {
            let sharedata = await handleRequest(`/permission/file/${fid}/shardata`, { metadata: "GET" }, 200);
            sharedata = sharedata.data.share_settings;
            if (Object.keys(sharedata).length === 0) {
                sharedata = undefined;
            }
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
                   <input type="text" id="first-name" class="form-control" value="${(sharedata.share_with == undefined) ? "" : sharedata.share_with.join(',')}" name="share_with" placeholder="user_names..">
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
                   <input type="date" id="contact-info" class="form-control" name="available_date" value="${sharedata.available_date}" placeholder="Mobile">
                 </div>
                 <div class="col-md-4">
                   <label>Max Access Limit : </label>
                 </div>
                 <div class="col-md-8 form-group">
                   <input type="number" id="password" min="1" class="form-control" name="max_share_limit" value="${sharedata.max_share_limit}" placeholder="enter limit">
                 </div>
                 <div class="custom-control custom-switch">
                 <input type="checkbox" class="custom-control-input" name="is_public" id="mackepublic" ${sharedata.is_public ? 'checked' : ''}>
                 <label class="custom-control-label" for="mackepublic">Make Public</label>
                 </div>
                 <div class="custom-control custom-switch">
                 <input type="checkbox" class="custom-control-input" name="is_unlimited" id="unlimited_access" ${sharedata.is_unlimited ? 'checked' : ''}>
                 <label class="custom-control-label" for="unlimited_access">unlimited access</label>
                 </div>
               </div>
             </div>
             <input type="text" class="form form-control-sm w-100" value="${window.location.protocol + "//" + window.location.host + "/share/file/" + fid}" id="filelink">
           </form>
         `,
                showCancelButton: true,
                confirmButtonText: 'Ok'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    let form = document.querySelector("#share_settings");
                    let formData = new FormData(form);
                    let object = { share_settings: {} };
                    formData.forEach((val, key) => {
                        object.share_settings[key] = val;
                    });
                    let config = {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(object)
                    }
                    console.log(object);
                    res = await handleRequest(`/permission/file/${fid}/shardata`, config, 200);
                    if (res == null) {
                        notifier.alert("Not able to update..");
                    } else {
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

async function update_file_tags(id, tags) {
    if (fileflag) {
        let data = handleRequest(`/file/${id}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tags: tags })
        }, 200);
        if (data == null) {
            notifier.alert("tag not updated..");
        }
    }
}

async function update_file_likes(event, id, status) {
    if (fileflag || fav_page) {
        let data = await handleRequest(`/file/${id}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ favorite: status })
        }, 200);
        if (data == null) {
            notifier.alert("not updated..");
        }
        if (data.favorite == false) {
            if (fav_page) {
                document.getElementById(`row-${id}`).remove();
                this.draw();
                return;
            }
            event.target.innerHTML = "";
            event.target.setAttribute("onclick", `update_file_likes(event,${id},true)`)
            event.target.innerHTML = "Add To Favorites";
        }
        if (data.favorite == true) {
            event.target.setAttribute("onclick", `update_file_likes(event,${id},false)`)
            event.target.innerHTML = "";
            event.target.innerHTML = `Favorie <i class="fa-solid fa-heart">`;
        }
    }

}

async function file_gen_timeline(fileid) {
    if (fileflag) {
        if (fileid == undefined) {
            notifier.alert("something went worng..");
        } else {
            fileid = Number.parseInt(fileid);
            let resx = await handleRequest(`/analytics/file/${fileid}/audit`, { method: "GET" }, 200);
            resx = resx.map((val) => {
                return {
                    date: `${new Date(val.time).toDateString()}`,
                    content: `accessed by <br> ${val.user} \n<br> msg :<span style="color:red"> ${val.message == undefined ? "" : val.message}</span>`
                }
            })
            $('#file-timeline').roadmap(resx, {
                eventsPerSlide: 10,
                prevArrow: '<i class="fa-solid fa-arrow-left"></i>',
                nextArrow: '<i class="fa-solid fa-arrow-right"></i>'
            });

        }
    }
}

async function file_download_functions(fileid, finame = undefined) {
    if (fileflag || folder_page) {
        let filid = Number.parseInt(fileid);
        if (!isNaN(fileid) && filid != undefined && fileid != null) {
            const url = `/file/${fileid}/content?type=full`;
            fetch(url)
                .then((response) => response.blob())
                .then((blob) => {
                    const a = document.createElement('a');
                    const url = window.URL.createObjectURL(blob);
                    a.href = url;
                    if (finame != undefined) {
                        file_name = finame;
                    }
                    a.download = file_name; // Replace with your desired file name
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                })
                .catch((error) => {
                    notifier.alert(`Error downloading the file : ${error.message}`);
                });


        }
    } else {
        console.log("lol");
    }
}

async function file_download_functions_live(fileid, finame = undefined) {
    if ((fileflag || folder_page) && (fileid != null || fileid != undefined)) {
        fileid = Number.parseInt(fileid);
        if (fileflag) {
            let controls = document.querySelector("#downdisplay");
            controls.innerHTML = `<progress id="downloadProgress" value="0" max="100"></progress><br>
            <span id="progressText">0%</span><br>
            <span id="downloadSpeed">0 KB/s</span><br>
            <span id="remainingTime">Calculating...</span>`;

            const downloadProgress = document.getElementById('downloadProgress');
            const progressText = document.getElementById('progressText');
            const downloadSpeed = document.getElementById('downloadSpeed');
            const remainingTime = document.getElementById('remainingTime');

            const start = Date.now();

            // fetch(`/file/164/content?type=full`)

            const xhr = new XMLHttpRequest();
            xhr.open('GET', `/file/${fileid}/content?type=full`, true); // Replace 'sample.txt' with the actual file URL
            xhr.responseType = 'blob';
            xhr.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentage = (event.loaded / event.total) * 100;
                    downloadProgress.value = percentage;
                    progressText.textContent = `${percentage.toFixed(2)}%`;

                    const currentTime = new Date().getTime();
                    const elapsedTime = (currentTime - startTime) / 1000; // seconds
                    const downloadRate = (event.loaded / elapsedTime);
                    downloadSpeed.textContent = `${(downloadRate / 1024).toFixed(2)} KB/s`;

                    const remainingBytes = event.total - event.loaded;
                    const remainingTimeInSeconds = remainingBytes / downloadRate;
                    const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
                    const remainingSeconds = Math.floor(remainingTimeInSeconds % 60);
                    remainingTime.textContent = `${remainingMinutes} min ${remainingSeconds} sec`;
                }
            });
            const startTime = new Date().getTime();
            xhr.onerror = function () {

            }
            xhr.send();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const blob = xhr.response;
                    const downloadLink = document.createElement('a');
                    downloadLink.href = URL.createObjectURL(blob);
                    downloadLink.download = file_name; // Specify the desired filename
                    // Simulate a click on the download link to trigger the download
                    downloadLink.style.display = 'none'; // Hide the link
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    downloadLink.onclick = function () {
                        downloadLink.remove();
                        controls.innerHTML = 'downloaded';
                    }
                }
            };
        }
        if (folder_page) {
            let controlsx = document.querySelector(`#dctrl-${fileid}`);
            controlsx.innerHTML = ` <progress id="downloadProgress-${fileid}"class="col-lg-7 col-md-6 col-sm-6 mx-2" value="0" max="100"></progress>
            <span id="progressText-${fileid}" class="col-lg-2 col-md-2 col-sm-2 mx-2">0%</span>
            <span id="downloadSpeed-${fileid}" class="col-lg-2 col-md-2 mx-2">0 KB/s</span>
            <span id="remainingTime-${fileid}" class="col-lg-2 col-md-2 mx-2">Calculating...</span>`;

            const downloadProgress = document.getElementById(`downloadProgress-${fileid}`);
            const progressText = document.getElementById(`progressText-${fileid}`);
            const downloadSpeed = document.getElementById(`downloadSpeed-${fileid}`);
            const remainingTime = document.getElementById(`remainingTime-${fileid}`);

            const start = Date.now();

            // fetch(`/file/164/content?type=full`)

            const xhr = new XMLHttpRequest();
            xhr.open('GET', `/file/${fileid}/content?type=full`, true); // Replace 'sample.txt' with the actual file URL
            xhr.responseType = 'blob';
            xhr.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentage = (event.loaded / event.total) * 100;
                    downloadProgress.value = percentage;
                    progressText.textContent = `${percentage.toFixed(2)}%`;

                    const currentTime = new Date().getTime();
                    const elapsedTime = (currentTime - startTime) / 1000; // seconds
                    const downloadRate = (event.loaded / elapsedTime);
                    downloadSpeed.textContent = `${(downloadRate / 1024).toFixed(2)} KB/s`;

                    const remainingBytes = event.total - event.loaded;
                    const remainingTimeInSeconds = remainingBytes / downloadRate;
                    const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
                    const remainingSeconds = Math.floor(remainingTimeInSeconds % 60);
                    remainingTime.textContent = `${remainingMinutes} min ${remainingSeconds} sec`;
                }
            });
            const startTime = new Date().getTime();
            xhr.onerror = function () {

            }
            xhr.send();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const blob = xhr.response;
                    const downloadLink = document.createElement('a');
                    downloadLink.href = URL.createObjectURL(blob);
                    downloadLink.download = finame; // Specify the desired filename
                    // Simulate a click on the download link to trigger the download
                    downloadLink.style.display = 'none'; // Hide the link
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    downloadLink.onclick = function () {
                        downloadLink.remove();
                    }
                    controlsx.innerHTML = 'downloaded';
                }
            };
        }
    }
}

async function file_pass_protect(event) {
    let swit = event.target;
    if (fileflag) {
        filid = Number.parseInt(fileid);
        if (!isNaN(fileid) && fileid != undefined) {
            Swal.fire({
                title: 'Set file password',
                input: 'text',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Set',
                showLoaderOnConfirm: true,
                preConfirm: (pass) => {
                    return fetch(`/file/${fileid}`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ password: pass == '' ? null : pass })
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(response.statusText)
                            }
                            return response.json()
                        })
                        .catch(error => {
                            Swal.showValidationMessage(
                                `failed to set password`
                            )
                        })
                },
                allowOutsideClick: () => !Swal.isLoading()
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire("success..")
                }
            })
        }
    }
}

//files related scripts
try {
    files_page = files_page;
} catch (error) {
    files_page = false;
}
try {
    fav_page = fav_page;
} catch (error) {
    fav_page = false;
}
try {
    recent_page = recent_page;
} catch (error) {
    recent_page = false;
}
let ix = 1;
var table;
async function populate_files_table(fromx, to) {
    if (files_page) {
        try {
            let res = await fetch(`/file/range?from=${fromx}&to=${to + 1}`, { method: "GET" });
            res = await res.json();
            res.forEach((val) => {
                let arr = [];
                arr.push(ix++);
                arr.push(val.id);
                arr.push(val.metadata.name);
                arr.push(`<a class="mx-2" href="/file/${val.id}"><i class="fa-solid fa-eye" style="color:green;"></i></a><span class="mx-2" onclick="deleteFile(${val.id},event);"><i class="fa-solid fa-trash" style="color:red"></i></span><span class="mx-2"><i class="fa-solid fa-pen-to-square" style="color:blue"></i></span>`);
                arr.push(((val.metadata.size) / 1024 / 1024).toFixed(2));
                table.row.add(arr).draw();
            });
        } catch (error) {
            res = [];
        }
    }
    if (fav_page != null && fav_page == true) {
        try {
            let res = await fetch(`/file/range?from=${fromx}&to=${to + 1}&favorite=true`, { method: "GET" });
            res = await res.json();
            res.forEach((val) => {
                let arr = [];
                arr.push(ix++);
                arr.push(val.id);
                arr.push(val.metadata.name);
                arr.push(`<a class="mx-2" href="/file/${val.id}"><i class="fa-solid fa-eye" style="color:green;"></i></a><span class="mx-2" onclick="deleteFile(${val.id},event);"><i class="fa-solid fa-trash" style="color:red"></i></span><button style="all:unset;" onclick="update_file_likes(event,'${val.id}',false)" class="mx-2"><i class="fa-solid fa-heart" style="color:blue"></i></button>`);
                arr.push(((val.metadata.size) / 1024 / 1024).toFixed(2));
                table.row.add(arr).draw();
            });
        } catch (error) {
            res = [];
        }
    }
    if (recent_page) {
        try {
            let res = await fetch(`/file/range?from=${fromx}&to=${to + 1}&favorite=true`, { method: "GET" });
            res = await res.json();
            res.forEach((val) => {
                let arr = [];
                arr.push(ix++);
                arr.push(val.id);
                arr.push(val.metadata.name);
                arr.push(`<a class="mx-2" href="/file/${val.id}"><i class="fa-solid fa-eye" style="color:green;"></i></a><span class="mx-2" onclick="deleteFile(${val.id},event);"><i class="fa-solid fa-trash" style="color:red"></i></span><button style="all:unset;" onclick="update_file_likes(event,'${val.id}',false)" class="mx-2"><i class="fa-solid fa-heart" style="color:blue"></i></button>`);
                arr.push(((val.metadata.size) / 1024 / 1024).toFixed(2));
                table.row.add(arr).draw();
            });
        } catch (error) {
            res = [];
        }
    }
    if (recent_page) {
        let form = document.querySelector("#timeform");
        form = new FormData(form);
        let obj = {};
        form.forEach((val, key) => {
            obj[key] = val;
        })
        // console.table(obj);

    }
}

const find_in_time = async (event) => {
    if (recent_page) {
        let form = document.querySelector("#timeform");
        form = new FormData(form);
        let obj = {};
        form.forEach((val, key) => {
            val = new Date(val).getTime();
            obj[key] = val;
        });
        // console.log(obj);
        let { fromtime, totime } = obj;
        if (fromtime == undefined || fromtime == '' || totime == undefined || totime == '') {
            return;
        }
        table.clear();
        table.draw();
        try {
            let res = await fetch(`/file/range?fromtime=${fromtime}&totime=${totime}`, { method: "GET" });
            res = await res.json();
            res.forEach((val) => {
                let arr = [];
                arr.push(ix++);
                arr.push(val.id);
                arr.push(val.metadata.name);
                arr.push(`<a class="mx-2" href="/file/${val.id}"><i class="fa-solid fa-eye" style="color:green;"></i></a><span class="mx-2" onclick="deleteFile(${val.id},event);"><i class="fa-solid fa-trash" style="color:red"></i></span><span class="mx-2"><i class="fa-solid fa-pen-to-square" style="color:blue"></i></span>`);
                arr.push(((val.metadata.size) / 1024 / 1024).toFixed(2));
                table.row.add(arr).draw();
            });
        } catch (error) {
            res = [];
        }

    }
}

//utils page
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


//live share
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
        socket.on("down-chunk", (data) => {
            console.log("recv ", data);
        })

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
            // socket.emit('file-upload', { id: roomid, data: file.files[0], name: file.files[0].name, type: file.files[0].type });
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
    // socket.emit('file-upload', { id: roomid, data: file.files[0], name: file.files[0].name, type: file.files[0].type });
    const reader = new FileReader();

    reader.onload = (e) => {
        const fileData = e.target.result;
        const fileName = file.files[0].name;
        const type = file.files[0].type;

        socket.emit('file-upload', { id: roomid, data: fileData, name: fileName, type: type });
    };
    reader.readAsArrayBuffer(file.files[0]);
    // file = file.files[0];

    // if (file) {
    //   const chunkSize = 1024 * 1024; // 1MB
    //   let offset = 0;

    //     while (offset < file.size) {
    //       const chunk = file.slice(offset, offset + chunkSize);
    //       offset += chunkSize;
    //       console.log(chunk);
    //       socket.emit('file-chunk', {id:roomid,chunkx:chunk});
    //     }


    // //   socket.on('transferComplete', () => {
    // //     console.log('File transfer complete.');
    // //   });
    // }
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

try {
    explore_view = explore_view;
} catch (error) {
    explore_view = false;
}

async function load_public_media(from, limit) {

    if (explore_view) {
        let medias = document.querySelector("#medias");
        // let load = medias.lastChild;
        // medias.lastChild.remove();
        if (explore_view) {
            let res = await handleRequest(`/explore/data?from=${from}&limit=${limit}`, {
                method: "GET"
            }, 200);
            if (res == null) {
                return;
            }
            res.forEach((val) => {

                let card = document.createElement("div");
                card.setAttribute("class", "col-lg-12 col-md-12 col-sm-12");
                try {
                    let tagc = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light']
                    let tagsx = "";
                    Array.from(val.tags).forEach((v) => {
                        tagsx += `<span class="mt-2 badge badge-${tagc[Number.parseInt(Math.random() * (7) + 0)]}">${v}</span>`;
                    })

                    card.innerHTML = `<div class="card col-lg-12 col-sm-12 col-md-12">
                <div class="card-header">
                ${val.createdBy} Shared publicaly at : ${new Date(val.updatedAt).toDateString()}
       </div>
           <div class="card-body">
           <img src="/file/${val.id}/content?type=thumb" loading="lazy" class="card-img-top" alt="#" onerror="this.remove()">
           <video src="/file/${val.id}/content" class="img-fluid rounded" alt="#" controls onerror="this.remove()"></video>
           <br>
               <h4 class="card-title">${val.metadata.name}</h4>
               <br>
               <div class="d-flex flex-row flex-wrat"><span>${tagsx}</span></div>
               <p class="card-text"><small class="text-muted">Updated at :${new Date(val.createdAt).toDateString()}</small></p>
               <div class="d-flex flex-row flex-wrap fs-12">
               <button onclick="handle_like_dislike(event,'${val.id}','like')" class="btn btn-sm btn-outline-success like p-2 cursor mx-2"><i class="fa-solid fa-thumbs-up"></i><span class="ml-1">Like(${val.like})</span></button>
               <button onclick="handle_like_dislike(event,'${val.id}','dislike')" class="btn btn-sm btn-outline-danger like p-2 cursor mx-2"><i class="fa-solid fa-thumbs-down"></i><span class="ml-1">Dislike(${val.dislike})</span></button>
               <button onclick="toggleCommentContainer('${val.id}')"s class="btn btn-sm btn-outline-info like p-2 cursor mx-2"><i class="fa-solid fa-comment"></i><span class="ml-1" >Comment</span></button>
               <button class="btn btn-sm btn-outline-primary like p-2 cursor mx-2"><i class="fa-solid fa-share"></i><span class="ml-1">Share</span></button>
           </div>
            </div>
            <div class="card-footer">
                    <div id="commentContainer-${val.id}" style="display: none;">
                        <h5>Comments</h5>
                        <ul id="commentList-${val.id}" class="list-unstyled" style="height:35vh;overflow-x:scroll;"></ul>
                        <div class="input-group mt-2">
                            <input type="text" id="commentInput-${val.id}" class="form-control" placeholder="Add a comment">
                            <div class="input-group-append">
                                <button class="btn btn-primary" onclick="addComment(${val.id})">Post</button>
                            </div>
                        </div>
                    </div>
                </div>
         </div>`;

                } catch (error) {
                    console.log(error.message);
                }
                medias.appendChild(card);
            });
            // medias.append(load);
        }
    }
}

const handle_like_dislike=async(event,fid,type)=>{
    let data;
   
    switch (type) {
        case 'like':
             data = await handleRequest(`/file/${fid}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ like : true })
            }, 200);
            event.target.innerHTML='';
            event.target.innerHTML=`<i class="fa-solid fa-thumbs-up"></i><span class="ml-1">Like(${data.like})</span>`;
            event.target.removeAttribute("onclick");
            event.target.setAttribute("disabled",'');
            break;
        case 'dislike':
            data = await handleRequest(`/file/${fid}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dislike: true })
            }, 200);
            event.target.innerHTML='';
            event.target.innerHTML=`<i class="fa-solid fa-thumbs-down"></i><span class="ml-1">Dislike(${data.dislike})</span>`;
            event.target.removeAttribute("onclick");
            event.target.setAttribute("disabled",'');
            break;
        default:
            break;
    }
}
// Function to toggle the comment container
async function toggleCommentContainer(cardId) {
    const commentContainer = document.getElementById(`commentContainer-${cardId}`);
    const commentList = document.getElementById(`commentList-${cardId}`);
    const commentInput = document.getElementById(`commentInput-${cardId}`);

    if (commentContainer.style.display === "none") {
        let comments = await handleRequest(`/explore/file/${cardId}/comments`, { method: "GET" }, 200);
        commentList.innerHTML="";
        for (const comment of comments) {
            const commentItem = document.createElement("div");
            commentItem.className = "media mt-2";
            commentItem.innerHTML = `
        <!--  <img src="user_avatar.jpg" class="mr-3" alt="${comment.username}" width="64">-->
        <div style="width:50px;height:50px" class="rounded-circle profile-icon bg-primary">MS</div>
          <div class="media-body">
              <small class="mt-0">${comment.username} </small>|<small class="text-muted"> ${new Date(comment.time).toDateString()}</small>
             <p> ${comment.text}</p>
          </div>
      `;
            commentList.appendChild(commentItem);
        }
        commentContainer.style.display = "block";
        commentInput.focus();
    } else {
        commentContainer.style.display = "none";
    }
}

// Function to add a comment to a card
async function addComment(cardId) {
    const commentInput = document.getElementById(`commentInput-${cardId}`);
    const commentList = document.getElementById(`commentList-${cardId}`);
    const commentText = commentInput.value.trim();

    if (commentText) {
        const commentItem = document.createElement("div");
        commentItem.className = "media mt-2";

        let res = await handleRequest(`/explore/file/${cardId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ comment: commentText })
        }, 201);
        if (res != null) {
            commentItem.innerHTML = `
            <!--  <img src="user_avatar.jpg" class="mr-3" alt="${res.username}" width="64">-->
            <div style="width:50px;height:50px" class="rounded-circle profile-icon bg-primary">MS</div>
              <div class="media-body">
                  <small class="mt-0">${res.username} </small>|<small class="text-muted"> ${new Date(res.time).toDateString()}</small>
                 <p> ${res.text}</p>
              </div>
          `;
            commentList.insertBefore(commentItem,commentList.firstChild);
        }
        commentInput.value = "";
    }
}


async function load_analytics_file() {
    var from = 0, limit = 10;
    async function load_and_addd_explore_file(from, limit) {
        let data = await handleRequest(`/analytics/files?from=${from}&limit=${limit}`, { method: "GET" }, 200);
        if (data == null) return;
        let tbody = document.querySelector("#analytics_file");
        if (tbody == null) return;
        for (let file of data) {
            let ext = file.name.split('.');
            ext = ext[ext.length - 1];
            let theme = "success";
            let icon = `<i class="fa-solid fa-file" style="width:35px"></i>`;
            switch (ext) {
                case 'pptx':
                    theme = "info";
                    icon = `<i class="fa-solid fa-file-powerpoint" style="width:35px"></i>`;
                    break;
                case 'pdf':
                    theme = "danger";
                    icon = `<i class="fa-solid fa-file-pdf" style="width:35px"></i>`;
                    break;
                case 'xlsx':
                    theme = "success";
                    icon = `<i class="fa-solid fa-file-excel" style="width:35px"></i>`;
                    break;
                case 'docx':
                    theme = "primary";
                    icon = `<i class="fa-solid fa-file-word" style="width:35px"></i>`;
                    break;
                case 'msi':
                    theme = "secondary";
                    icon = `<i class="fa-solid fa-file-code" style="width:35px"></i>`;
                    break;
                case 'zip':
                    theme = "secondary";
                    icon = `<i class="fa-solid fa-file-zipper" style="width:35px"></i>`;
                    break;
                case 'exe':
                    theme = "secondary";
                    icon = `<i class="fa-solid fa-file-code" style="width:35px"></i>`;
                    break;
                case 'mkv':
                    theme = "info";
                    icon = `<i class="fa-solid fa-video" style="width:35px"></i>`;
                    break;
                default:
                    theme = "secondary";
                    icon = `<i class="fa-solid fa-file" style="width:35px"></i>`;
                    break;
            }

            let tr = document.createElement("tr");
            tr.innerHTML = `<td>
          <div class="d-flex align-items-center">
              <div class="icon-small bg-${theme} rounded mr-3">
                  ${icon}
              </div>
              <div style="cursor: pointer;" onclick="window.location.href='/file/${file.id}'"><marquee>${file.name}</marquee></div>
          </div>
      </td>
      <td><marquee>${new Date(file.lastedit).toDateString()} ${file.editor}</marquee></td>
      <td>${(file.size / 1024 / 1024).toFixed(3)} MB</td>
      <td>
          <div class="dropdown">
              <span class="dropdown-toggle" id="dropdownMenuButton6" data-toggle="dropdown">
                  <i class="ri-more-fill"></i>
              </span>
              <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton6">
                  <a class="dropdown-item" href="/file/${file.id}"><i class="ri-eye-fill mr-2"></i>View</a>
                  <a class="dropdown-item" onclick=""><i class="ri-delete-bin-6-fill mr-2"></i>Delete</a>
                  <a class="dropdown-item" href="#"><i class="ri-pencil-fill mr-2"></i>Edit</a>
                  <a class="dropdown-item" href="#"><i class="ri-printer-fill mr-2"></i>Print</a>
                  <a class="dropdown-item" href="#"><i class="ri-file-download-fill mr-2"></i>Download</a>
              </div>
          </div>
      </td>`;
            tbody.appendChild(tr);
        }
    }

    if (index_page) {
        await load_and_addd_explore_file(from, limit)
        var scrollableDiv = document.getElementById("scroll_place");

        scrollableDiv.addEventListener("scroll", async function () {
            if (
                scrollableDiv.scrollTop + scrollableDiv.clientHeight >=
                scrollableDiv.scrollHeight
            ) {
                await load_and_addd_explore_file(from + limit + 1, limit)
                from += limit + 1;
            }
        });
    }
}

// index-page
async function load_index_docs() {
    if (index_page) {
        var from = 0, limit = 5;
        let holder = document.querySelector("#index_docs");

        async function add_docs_to_holder(from = 0, limit = 5) {
            let data = await handleRequest(`/analytics/docs?from=${from}&limit=${limit}`, { method: "GET" }, 200);
            for (const file of data) {
                let dv = document.createElement("div");
                dv.setAttribute("class", "col-lg-3 col-md-6 col-sm-6 bb");
                dv.innerHTML = `<div class="card card-block card-stretch card-height">
           <div class="card-body image-thumb">
               <a href="#" data-title="${file.name}" data-load-file="file" data-load-target="#resolte-contaniner" data-url="${file.path}" data-toggle="modal" data-target="#exampleModal">
               <div class="mb-4 text-center p-3 rounded iq-thumb">
                   <div class="iq-image-overlay"></div>
                   <img src="${get_meta_card_from_ext(file.name.split(".").slice(-1)[0]).image}" class="img-fluid" alt="image1">
               </div>
               <h6><marquee>${file.name}</marquee></h6>  
               </a>   
           </div>
       </div>`;
                holder.appendChild(dv);
            }
        }

        add_docs_to_holder(from, limit);

        holder.addEventListener("scroll", async function () {
            if (
                holder.scrollLeft + holder.offsetWidth >=
                holder.scrollWidth - 1
            ) {
                add_docs_to_holder(from + limit + 1, limit);
                from += limit + 1;
            }
        });
    }
}

async function generate_chart() {
    let data = await handleRequest("/analytics/storage", { method: "GET" }, 200);
    let totgb = (Number.parseInt(data.used) / 1024 / 1024 / 1024).toFixed(2);
    //chart card;
    let storage_card_sidebar = document.querySelector("#storage_card_sidebar");
    storage_card_sidebar.innerHTML = ` <h4 class="mb-3"><i class="fa-solid fa-cloud"></i>Storage</h4>
    <p>${totgb} GB Used from 20GB</p>
    <div class="iq-progress-bar mb-3">
        <span class="bg-primary iq-progress progress-1" data-percent="${(totgb / 20).toFixed(2) * 100}" style="transition: width 2s ease 0s; width: ${(totgb / 20).toFixed(2) * 100}%;">
        </span>
    </div>
    <p>${(totgb / 20).toFixed(2) * 100}% Full - ${20 - totgb} GB Free</p>
    <a class="btn btn-outline-primary view-more mt-4">Buy Storage</a>`;
    if (index_page) {
        let mb = [];
        let map = new Map();
        for (let usage of data.monthly_usage) {
            map.set(Number.parseInt(usage.month), (Number.parseInt(usage.size) / 1024 / 1024).toFixed(2))
        }
        for (let month = 1; month <= 12; month++) {
            if (map.has(month)) {
                mb.push(map.get(month))
            }
            else {
                mb.push(0);
            }
        }

        var options = {
            series: [{
                name: "MB",
                data: mb
            }],
            chart: {
                height: 350,
                type: 'line',
                zoom: {
                    enabled: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'stepline'
            },
            title: {
                text: 'Storage Used By Month',
                align: 'left'
            },
            grid: {
                row: {
                    colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                    opacity: 0.5
                },
            },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            }
        };

        var chart = new ApexCharts(document.querySelector("#storage_chart"), options);
        chart.render();

        //storage uploads and downloads
        data = await handleRequest("/analytics/upanddowns", { method: "GET" }, 200);
        document.querySelector("#ups").innerHTML = data.downloads;
        document.querySelector("#downs").innerHTML = data.uploads;

        let uploads = [], downloads = [];

        let mp = new Map();
        data.data.forEach((val) => {
            mp.set(Number.parseInt(val.month), { up: val.uploads, dw: val.downloads });
        })
        for (let month = 1; month <= 12; month++) {
            if (mp.has(month)) {
                uploads[month] = Number.parseInt(mp.get(month).up);
                downloads[month] = Number.parseInt(mp.get(month).dw);
            }
            else {
                uploads[month] = 0;
                downloads[month] = 0;
            }
        }
        uploads.shift();
        downloads.shift();
        var options = {
            series: [{
                name: 'Uploads',
                data: uploads
            }, {
                name: 'Downloads',
                data: downloads
            }],
            chart: {
                type: 'bar',
                height: 400
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    dataLabels: {
                        position: 'top',
                    },
                }
            },
            dataLabels: {
                enabled: true,
                offsetX: -6,
                style: {
                    fontSize: '12px',
                    colors: ['#fff']
                }
            },
            stroke: {
                show: true,
                width: 1,
                colors: ['#fff']
            },
            tooltip: {
                shared: true,
                intersect: false
            },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            },
        };

        var chart = new ApexCharts(document.querySelector("#downloadchart"), options);
        chart.render();

    }
}

async function update_storage_chart(gap) {
    document.querySelector("#storage_chart").innerHTML = '';
    let data = await handleRequest(`/analytics/storage/usage?gap=${gap}`, { method: "GET" }, 200);

    if (index_page) {
        switch (gap) {
            case 'monthly':
                var mb = [];
                let map = new Map();
                for (let usage of data) {
                    map.set(Number.parseInt(usage.month), (Number.parseInt(usage.size) / 1024 / 1024).toFixed(2))
                }
                for (let month = 1; month <= 12; month++) {
                    if (map.has(month)) {
                        mb.push(map.get(month))
                    }
                    else {
                        mb.push(0);
                    }
                }

                var options = {
                    series: [{
                        name: "MB",
                        data: mb
                    }],
                    chart: {
                        height: 350,
                        type: 'line',
                        zoom: {
                            enabled: false
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: 'stepline'
                    },
                    title: {
                        text: 'Storage Used By Month',
                        align: 'left'
                    },
                    grid: {
                        row: {
                            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                            opacity: 0.5
                        },
                    },
                    xaxis: {
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    }
                };

                var chart = new ApexCharts(document.querySelector("#storage_chart"), options);
                chart.render();
                break;
            case 'yearly':
                mb = [];
                years = [];
                for (let usage of data) {
                    mb.push((Number.parseInt(usage.size) / 1024 / 1024).toFixed(2));
                    years.push(usage.year);
                }

                options = {
                    series: [{
                        name: "MB",
                        data: mb
                    }],
                    chart: {
                        height: 350,
                        type: 'line',
                        zoom: {
                            enabled: false
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    stroke: {
                        curve: 'stepline'
                    },
                    title: {
                        text: 'Storage Used By Year',
                        align: 'left'
                    },
                    grid: {
                        row: {
                            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                            opacity: 0.5
                        }
                    },
                    labels: years
                };
                var chart = new ApexCharts(document.querySelector("#storage_chart"), options);
                chart.render();
                break;
            default:
                break;
        }
    }
}



// search bar related
let holder = document.querySelector("#reslts");
// sbar.addEventListener("input",async()=>{

// })

async function load_searches(event, resultid) {
    holder = document.getElementById(resultid);

    let data = await handleRequest(`/analytics/files/search?q=${event.target.value}`, { method: "GET" }, 200);
    holder.innerHTML = '';
    if (data.length == 0) {
        return;
    }
    let i = 0;
    for (let val of data) {
        let lix = document.createElement("li");
        lix.innerHTML = `<a href="/file/${val.id}"> <span><small><marquee>${val.name} (${val.mime.split('/')[1]})</marquee></small></span></a></li>`;
        holder.appendChild(lix);
    }
}

// utils
async function util_extract_json_from_formdata(formData) {


}

function get_meta_card_from_ext(ext) {
    let map = new Map();
    map.set('pdf', {
        image: "/assets/images/layouts/page-1/pdf.png"
    })
    map.set('pptx', {
        image: "/assets/images/layouts/page-1/ppt.png"
    })
    map.set('docx', {
        image: "/assets/images/layouts/page-1/doc.png"
    })
    map.set('xlsx', {
        image: "/assets/images/layouts/page-1/xlsx.png"
    })
    map.set('csv', {
        image: "/assets/images/layouts/page-1/xlsx.png"
    });
    let res = map.get(ext);
    if (res == undefined) return { image: "/assets/images/layouts/page-1/file.png" }
    return res;
}

// // Check if the browser supports the Cache API
// if ('caches' in window) {
//     // Define a cache name
//     const cacheName = 'src';

//     // Define an array of URLs to cache
//     const urlsToCache = ["/assets/js/doc-viewer.js", "/assets/js/app.js", "/assets/vendor/doc-viewer/include/officeToHtml/officeToHtml.js", "/assets/vendor/doc-viewer/include/verySimpleImageViewer/js/jquery.verySimpleImageViewer.js",
//         "/assets/vendor/doc-viewer/include/SheetJS/xlsx.full.min.js", "/assets/vendor/doc-viewer/include/SheetJS/handsontable.full.min.js", "/assets/vendor/doc-viewer/include/PPTXjs/js/divs2slides.js", "/assets/vendor/doc-viewer/include/PPTXjs/js/pptxjs.js"
//         , "/assets/vendor/doc-viewer/include/PPTXjs/js/nv.d3.min.js", "/assets/vendor/doc-viewer/include/PPTXjs/js/d3.min.js", "/assets/vendor/doc-viewer/include/PPTXjs/js/filereader.js", "/assets/vendor/doc-viewer/include/docx/mammoth.browser.min.js",
//         "/assets/vendor/doc-viewer/include/docx/mammoth.browser.min.js", "/assets/vendor/doc-viewer/include/docx/jszip-utils.js", "/assets/vendor/doc-viewer/include/pdf/pdf.js", "/assets/js/chart-custom.js", "/assets/js/customizer.js", "/assets/js/backend-bundle.min.js",
//         "/assets/vendor/fontawesome/css/solid.css", "/assets/vendor/fontawesome/css/solid.css", "/assets/vendor/doc-viewer/include/officeToHtml/officeToHtml.css", "/assets/vendor/doc-viewer/include/verySimpleImageViewer/css/jquery.verySimpleImageViewer.css",
//         "/assets/vendor/doc-viewer/include/SheetJS/handsontable.full.min.css", "/assets/vendor/doc-viewer/include/PPTXjs/css/nv.d3.min.css", "/assets/vendor/doc-viewer/include/PPTXjs/css/pptxjs.css", "/assets/vendor/doc-viewer/include/pdf/pdf.viewer.css"
//     ];

//     // Open the cache
//     caches.open(cacheName)
//         .then(function (cache) {
//             // Iterate through the URLs and cache each one
//             urlsToCache.forEach(function (url) {
//                 // Fetch the resource from the network
//                 fetch(url)
//                     .then(async function (response) {
//                         if (response.status === 200) {
//                             // If the resource was fetched successfully, add it to the cache
//                             cache.put(url, response);
//                         }
//                     })
//                     .catch(function (error) {
//                         console.error('Error fetching resource:', error);
//                     });
//             });
//         });
// }

//notifications..
async function start_notification_srv() {
    // Client-side code (in the browser)
    let user_email_s = sessionStorage.getItem("user_email");
    if (user_email_s == null) {
        sessionStorage.setItem("user_email", user_email);
        user_email_s = user_email;
    }

    let oldnotification = localStorage.getItem("notifications") == null ? [] : JSON.parse(localStorage.getItem("notifications"));
    if (oldnotification.length >= 15) {
        oldnotification.shift();
    }
    oldnotification.forEach((val) => {
        add_notification(val, "notifictions");
    })

    let notisocket = io("/user/notification");
    notisocket.emit("join-room", { id: user_email_s });
    notisocket.on("connect", (socket) => {
        notisocket.on("notification", (data) => {
            oldnotification.push(data);
            if (oldnotification.length >= 15) {
                oldnotification.shift();
            }
            localStorage.setItem("notifications", JSON.stringify(oldnotification));
            add_notification(data, "notifictions");
            const audio = new Audio("https://vgmsite.com/soundtracks/among-us-sound-effects/udbpcpqmyr/Notification.mp3");
            audio.play();
            notifier.success(`notification from ${data.author}`);

        });
    })
    notisocket.on("ping", (data) => {
        // console.log(data);
    })
}

function add_notification(data, contaniner = null) {
    if (contaniner == null || contaniner == "") {
        return;
    }
    let holder = document.querySelector(`#${contaniner}`);
    let card = `<div class="rounded-circle iq-card-icon-small bg-primary" data-toggle="popover" data-placement="right" title="${data.author}" data-content="${data.author}">
    ${data.author.charAt(0) + data.author.charAt(1)}
</div>
<div class="media-body ml-3">
    <div class="media justify-content-between">
        ${data.msg}
   <!-- <p class="mb-0 font-size-12">${data.author}</p>-->
    </div>
    <p class="mb-0 font-size-12">
    <a target="_blank" href='${data.data.url}' class="btn btn-sm btn-primary" >view</a>
    </p>
</div>     `;

    let dv = document.createElement("div");
    dv.setAttribute("class", "media align-items-center mb-3");
    dv.innerHTML = card;
    holder.appendChild(dv);
}

window.onload = async () => {
    try {
        update_sidebar();
    } catch (error) {

    }
    try {
        await start_notification_srv();
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
    try {
        await load_analytics_file()
        console.table(data);
    } catch (error) {

    }
    try {
        load_index_docs();
    } catch (error) {

    }
    try {
        generate_chart();
    } catch (error) {

    }

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