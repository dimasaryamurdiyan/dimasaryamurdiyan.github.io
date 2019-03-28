/*
Indexed DB
*/ 

function createDatabase(){
    //check website is support or not
    if(!('indexedDB' in window)){
        console.log('Web browser tidak mendukung IndexedDb');
        return;
    }

    var req = window.indexedDB.open('db-test');

    req.onerror = errorHandle;
    req.onupgradeneeded = function (e){
        var db = e.target.result;
        db.onerror = errorHandle;
        var objStore = db.createObjectStore('mahasiswa',{keyPath : 'nim'});
        console.log('Object mahasiswa berhasil dibuat');
    }
    req.onsuccess = function (e){
        db = e.target.result;
        db.onerror = errorHandle;
        console.log('Berhasil melakukan koneksi ke IDB');
        //doing something

        bacaDariIDB();
    }
}


function errorHandle(e){
    console.log('Error IDB' + e.target.errorCode);
}

createDatabase();
var tabel = document.getElementById('tabel-mahasiswa'),
    form = document.getElementById('form-tambah'),
    nama = document.getElementById('nama'),
    nim = document.getElementById('nim'),
    gender = document.getElementById('gender');

form.addEventListener('submit', addRow);

function addRow(e){
    //cek nim  sudah ada apa belum
    if(tabel.rows.namedItem(nim.value)){
        alert("Error : Nim sudah terdaftar");
        e.preventDefault();
        return;
    }
    console.log('test');
    insertToDB({
        nim : nim.value,
        nama : nama.value,
        gender : gender.value
    });

    //table modification with adding appendChild() function -> javascript DOM
    var row = tabel.insertRow(); //<tr></tr>
    row.id = nim.value;//<tr id="here"></tr>
    row.insertCell().appendChild(document.createTextNode(nim.value));//<td>123</td>
    row.insertCell().appendChild(document.createTextNode(nama.value));
    row.insertCell().appendChild(document.createTextNode(gender.value));

    //button
    var btn = document.createElement('input');
    btn.type = 'button';
    btn.value = 'Hapus';
    btn.id = nim.value;
    btn.className = 'btn btn-danger btn-sm'
    row.insertCell().appendChild(btn);
    e.preventDefault();
}

function insertToDB(mahasiswa){
    var objStore = makeTransaction().objectStore('mahasiswa');
    var req = objStore.add(mahasiswa);
    req.onerror = errorHandle;
    req.onsuccess - console.log("Mahasiswa NIM "+ mahasiswa.nim + "berhasil ditambahkan ke DB");
}

function makeTransaction(){
    var transaction = db.transaction(['mahasiswa'],'readwrite');
    transaction.onerror = errorHandle;
    transaction.oncomplete = console.log("Transaksi selesai");

    return transaction;
}

function bacaDariIDB(){
    var objStore = makeTransaction().objectStore('mahasiswa');
    objStore.openCursor().onsuccess = function(e) {
        var result = e.target.result;
        if(result){
            console.log('Membaca ['+result.value.nim+'] dari IDB');

            var row = tabel.insertRow(); //<tr></tr>
            row.id = result.value.nim;//<tr id="here"></tr>
            row.insertCell().appendChild(document.createTextNode(result.value.nim));//<td>123</td>
            row.insertCell().appendChild(document.createTextNode(result.value.nama));
            row.insertCell().appendChild(document.createTextNode(result.value.gender));
        
            //button
            var btn = document.createElement('input');
            btn.type = 'button';
            btn.value = 'Hapus';
            btn.id = result.value.nim;
            btn.className = 'btn btn-danger btn-sm'
            row.insertCell().appendChild(btn);
            result.continue();
        }
    }
}

tabel.addEventListener('click',destroyRow);
function destroyRow(e){
    if(e.target.type ==='button'){
        var destroy = confirm('Apakah anda yakin ingin menghapus data?');
        if(destroy){
            tabel.deleteRow(tabel.rows.namedItem(e.target.id).sectionRowIndex);
            //action
            destroyFromDB(e.target.id);
        }
    }
}

function destroyFromDB(nim){
    var objStore = makeTransaction().objectStore('mahasiswa');
    var req = objStore.delete(nim);
    req.errorCode = errorHandle;
    req.onsuccess = console.log('Berhasil menghapus Mahasiswa ['+nim+']');
}