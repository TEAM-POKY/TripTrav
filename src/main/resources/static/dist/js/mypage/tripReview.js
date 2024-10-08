console.log("review in");
var tripPlaceReviewList = document.querySelector(".tripPlaceReviewList");
var tripFoodReviewList = document.querySelector(".tripFoodReviewList");

getReviewList(unoNum)
    .then(data => {
        console.log(data);
        if(data.length === 0){
            tripPlaceReviewList.appendChild(noChild("review"));
            tripFoodReviewList.appendChild(noChild("review"));
        }
        data.forEach(datas => {
            const review = datas.review;
            const imagePaths = datas.imagePaths;
            if (!imagePaths || imagePaths.length === 0) {
                console.log("이미지 경로가 없습니다.");
            } else {
                // console.log(imagePaths);
            }

            const li = document.createElement("li");
            const div = document.createElement("div");
            div.classList.add("tripCard");
            div.innerHTML = `
                <div class="tripReviewImgDiv"></div>
                <div class="tripReviewInfo">
                    <ul class="tripReviewUl">
                        <li><h3 class="reviewPlaceName">${review.reContentId}</h3></li>
                        <li><p class="reviewRating">${convertRatingToStars(`${review.reRate}`)}</p></li>
                        <li><p class="reviewRegDate">${changeDate(`${review.reDate}`)}</p></li>
                        <li><p class="reviewContent">${review.reContent}</p></li>
                    </ul>
                </div>
                <div class="tripSetting">
                    <ul>
                        <li><button type="button" onclick="showPopup(${review.rno})"><img src="/dist/image/edit-2.svg"></button></li>
                        <li><button type="button" onclick="deleteReview(${review.rno})"><img src="/dist/image/trash-2.svg"></button></li>
                    </ul>
                </div>`;
            const imageDiv = div.querySelector(".tripReviewImgDiv");
            imagePaths.forEach((src) => {
                const image = document.createElement("img");
                const changeSrc = src.replace("C:\\userImage\\", ""); // 경로 수정
                image.classList.add("tripReviewImg");
                image.src = `/reviewImages/${changeSrc}`; // 이미지 경로 설정
                imageDiv.appendChild(image); // 현재 이미지 div에 이미지 추가
            });
            li.appendChild(div);
            switch (review.reContentType) {
                case 39:
                    tripFoodReviewList.appendChild(li);
                    break;
                case 12:
                    tripPlaceReviewList.appendChild(li);
                    break;
            }
        });
        requestAnimationFrame(() => {
            if (!tripPlaceReviewList.hasChildNodes()) {
                tripPlaceReviewList.appendChild(noChild("review"));
            }
            if (!tripFoodReviewList.hasChildNodes()) {
                tripFoodReviewList.appendChild(noChild("review"));
            }
        });
    })
    .catch(err => {
        console.log(err);
    });

//리뷰 삭제
async function deleteReview(rno) {
    try {
        const url = `/review/reviewDelete/${rno}`;
        const config = {
            method: 'DELETE'
        };
        const resp = await fetch(url, config);
        if (resp.ok) {
            alert("리뷰가 삭제되었습니다.");
            window.location.reload();
        } else {
            alert("리뷰 삭제에 실패했습니다.");
        }
    } catch (error) {
        console.log(error);
        alert("오류가 발생했습니다.");
    }
}




function showPopup(rno) {
    window.open("/mypage/reviewPopup?rno="+rno, "blank", "width=800, height=800, left=400, top=400");
}

async function getReviewList(unoNum) {
    try {
        const url = "/mypage/getReview?uno=" + unoNum;
        const config = {
            method: "GET"
        }
        const response = await fetch(url, config);
        return await response.json();
    } catch (e) {
        console.log(e);
    }
}

//별점 별로 변환함수
function convertRatingToStars(rating) {
    const starFull = '<img src="/dist/image/star-full.png" alt="Full Star">';
    const starHalf = '<img src="/dist/image/star-half.png" alt="Half Star">';
    const starEmpty = '<img src="/dist/image/star-empty.png" alt="Empty Star">';

    let stars = '';

    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars += starFull;
        } else if (rating >= i - 0.5) {
            stars += starHalf;
        } else {
            stars += starEmpty;
        }
    }
    return stars;
}