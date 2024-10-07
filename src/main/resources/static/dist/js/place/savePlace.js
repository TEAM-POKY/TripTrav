const savePlaceModal = document.querySelector('.savePlaceModal');

function savePlace(event){
    if (typeof userNickname === 'undefined') {
        event.preventDefault();
        if(confirm("로그인 한 사용자만 이용가능 한 서비스입니다. \n로그인 페이지로 이동하시겠습니까?")){
            document.getElementById('myModal').style.display = 'flex';
        }
    }else{
        savePlaceModal.style.display='flex';
        const modal = `<div class="spModalWrap">
                            <div class="spModalCloseBtn" onclick="closeModal()">&times;</div>
                            <div class="myPlan">
                                <span>내 여행일정</span>
                                <ul class="myPlanUl"></ul>
                                <button class="createPlanBtn" onclick="createPlan()">새로운 일정 생성하기</button>
                            </div>
                        </div>`
        savePlaceModal.innerHTML=modal;
        getUserSchedule(unoNum).then(result=>{
            if(result.length>0){
                result.forEach(r=>{
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const scheStart = new Date(r.scheStart.substring(0,10))

                    //현재날짜 기준으로 예정된 일정만 출력
                    if(scheStart>=today){
                        const div = `<div class="myPlaceInfo" data-sco="${r.sco}">
                                                <img src="${r.scheImg}" class="placeFirstImg">
                                                <div class="myPlaceName">${r.scheName}</div>
                                                <div class="scheduleDuration">${r.scheStart.substring(0,10).replaceAll('-','.')} 
                                                    ~ ${r.scheEnd.substring(0,10).replaceAll('-','.')}</div>
                                                <button class="plusPlan">여행지 +</button>
                                             </div>`;
                        document.querySelector('.myPlanUl').innerHTML+=div;
                    }
                })
            } else {
                console.log("일정이 없는 유저")
                document.querySelector('.myPlanUl').innerHTML=`<div class="noPlanText">현재 예정된 일정이 없습니다.<span>새로운 일정을 생성해보세요!</span></div>`
            }
        })
    }
}

function closeModal(){
    savePlaceModal.style.display='none';
}

function createPlan(){
    fetch(detailInfoUrl)
        .then(response=>response.json())
        .then(data=>{
            console.log(data)
            const jsonData = data.response.body.items.item[0];
            document.querySelector('.myPlan').innerHTML='';
            const createPage = `<form id="tripForm" method="post">
                                            <div class="createPlan">
                                             <input class="createPlanName" placeholder="일정의 제목을 작성해주세요.">
                                             <div class="calendarArea">
                                                <div class="departArea">
                                                     <img src="/dist/image/calendar.svg" class="departCalendar">
                                                     : <input id="departureDate" type="text" placeholder="시작일" readonly >
                                                </div>
                                                <div class="returnArea">
                                                    <img src="/dist/image/calendar.svg" class="returnCalendar">
                                                    : <input id="returnDate" type="text" placeholder="종료일" readonly >
                                                </div>
                                            </div>
                                             <div class="currentPlaceInfo" data-id="${jsonData.contentid}">
                                                <img src="${jsonData.firstimage}" class="placeFirstImg">
                                                <div class="currentPlaceName">${jsonData.title}</div>
                                                <div class="currentPlaceAddr">${jsonData.addr1}</div>
                                             </div>
                                             <button type="submit" class="makePlan">일정 생성하기</button>
                                            </div>
                                        </form>`
            document.querySelector('.myPlan').innerHTML+=createPage;

            flatpickr.localize(flatpickr.l10ns.ko);

            const today = new Date();

            const departurePickr = flatpickr('#departureDate',{
                minDate: today,
                dateFormat: "Y-m-d",
                onchange: function (selectedDates, dateStr, instance){
                    returnPickr.clear();
                    returnPickr.set("minDate",dateStr);
                }
            });

            const returnPickr = flatpickr("#returnDate", {
                minDate: today,
                dateFormat: "Y-m-d",
                onChange: function(selectedDates, dateStr, instance) {
                    const departureDate = departurePickr.selectedDates[0];
                    const maxTripDuration = 2 * 24 * 60 * 60 * 1000;

                    if (selectedDates[0] - departureDate > maxTripDuration) {
                        alert("최대 2박 3일까지만 여행을 만들 수 있습니다");
                        returnPickr.clear();
                    }
                }
            });
            setupTripFormListener();
        })
}

function setupTripFormListener() {
    const tripForm = document.getElementById("tripForm");

    if (tripForm) {
        console.log('tripForm');
        tripForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const createPlanName = document.querySelector(".createPlanName").value;
            const departureDate = document.getElementById("departureDate").value;
            const returnDate = document.getElementById("returnDate").value;
            const currentPlaceName = document.querySelector('.currentPlaceName').innerText;
            const placeFirstImg = document.querySelector('.placeFirstImg').getAttribute('src');

            const startDate = new Date(departureDate);
            const endDate = new Date(returnDate);
            const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

            const requestBody = {
                sche_name: createPlanName,
                sche_start: departureDate,
                sche_end: returnDate,
                sche_count: totalDays,
                sche_img: placeFirstImg,
                uno: unoNum
            };
            console.log(requestBody);

            fetch(`/schedule/createPlan/${contentId}/${currentPlaceName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            })
                .then(response => response.text())
                .then(data => {
                    //alert창 띄우는 조건 변경해야함
                    if(data.message){
                        alert('일정이 성공적으로 저장되었습니다!');
                    } else {
                        alert('일정 저장 중 오류가 발생했습니다. \n다시 시도해주세요.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    } else {
        console.warn("tripForm이 존재하지 않습니다.");
    }
}

async function getUserSchedule(uno){
    try{
        const url = "/schedule/getUserSchedule/"+uno;
        const config = {method: 'get'}
        const response = await fetch(url, config);
        return response.json()
    } catch (e) {
        console.log(e);
    }
}

document.addEventListener('click',(e)=>{
    console.log(e.target);
    if (e.target && e.target.classList.contains('plusPlan')) {
        const myPlaceInfo = e.target.closest('.myPlaceInfo');
        const sco = myPlaceInfo.getAttribute('data-sco');
        const title = document.querySelector('.locationTitle').innerText;
        console.log(sco, contentId, title);
        addPlacePlan(sco, contentId, title);
    }
})

function addPlacePlan(sco, scheContentId, scheTitle){
    const newPlace = {
        sco:sco,
        scheContentId: scheContentId,
        scheTitle:scheTitle
    }
    fetch("/schedule/addPlaceInPlan",{
        method:'post',
        headers:{
            'content-type':'application/json'
        },
        body:JSON.stringify(newPlace)
    }).then(response => response.text())
        .then(data=>{
            console.log(data)
        })
}
