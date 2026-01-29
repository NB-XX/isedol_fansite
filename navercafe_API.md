---
title: 默认模块
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# 默认模块

Base URLs:

# Authentication

# naver cafe

## GET 查询指定文章内容

GET /gw/v4/cafes/27842958/articles/21386707

27842958 为咖啡厅ID
21386707 为帖子ID

> 返回示例

> 200 Response

```json
{
  "result": {
    "cafeId": 27842958,
    "articleId": 21386707,
    "pageId": "uhqCJDqZQfC1ue2m9ogVXw",
    "pageGroupId": "uPWU0Gl3QlCV8P_WaFIKBw",
    "heads": [],
    "article": {
      "id": 21386707,
      "refArticleId": 21386707,
      "menu": {
        "id": 345,
        "name": "▶ 이세돌의 공지사항",
        "menuType": "B",
        "boardType": "L",
        "badMenu": false,
        "badMenuByRestrict": false
      },
      "subject": "[비챤] 챠니다!!!!!!!!",
      "writer": {
        "memberKey": "Q6r9zdooAwLOTayf7c917g",
        "baMemberKey": "77d400ad16ba832f036b099957d8de8ec47b43470329a1a65924dd7721e0e6bd",
        "nick": "비챤",
        "image": {
          "url": "https://cafeptthumb-phinf.pstatic.net/MjAyMjEwMDlfMTY5/MDAxNjY1MzA0MjU3MTkz.P_G0-DkE2amwjhpyWPaJmDZ-VUW9r1hss1_ubyn3hYog.tGmy4VR229FoTq2gz6v6vVkdU91iMtIwvMsKc4tvIAcg.GIF/2022100725EF25BC25BF172113.gif",
          "service": "CAFE",
          "type": "c77_77",
          "isAnimated": false
        },
        "memberLevel": 888,
        "memberLevelName": "카페스탭",
        "memberLevelIconUrl": "https://cafe.pstatic.net/levelicon/1/1_888.gif",
        "currentPopularMember": false,
        "allowMemberAlarm": true,
        "isCafeMember": true
      },
      "subscribeWriter": {
        "subscribe": false,
        "push": false
      },
      "writeDate": 1769157243373,
      "readCount": 1418,
      "commentCount": 128,
      "decorator": {
        "isShowSuicideSaver": false,
        "isPlug": false
      },
      "existScrapAddContent": false,
      "template": {
        "isUse": false
      },
      "contentHtml": "<div class=\"se-viewer se-theme-default\" lang=\"ko-KR\">\n    <!-- SE_DOC_HEADER_START -->\n    <!--@CONTENTS_HEADER-->\n    <!-- SE_DOC_HEADER_END -->\n    <div class=\"se-main-container\">\n                <div class=\"se-component se-sticker se-l-default\" id=\"SE-D1BCC7B4-25C6-481D-B5F3-71B0C5DC6CF6\">\n                    <div class=\"se-component-content\">\n                        <div class=\"se-section se-section-sticker se-section-align-center se-l-default\">\n                            <div class=\"se-module se-module-sticker\">\n                                <a href=\"#\" onclick=\"return false;\" class=\"__se_sticker_link __se_link\" data-linktype=\"sticker\" data-linkdata='{\"src\" : \"\", \"packCode\" : \"ogq_614a347f4ae14\", \"seq\" : \"1\", \"width\" : \"\", \"height\" : \"\"}'>\n                                    <img src=\"https://storep-phinf.pstatic.net/ogq_614a347f4ae14/original_1.png?type=p50_50\" alt=\"\" class=\"se-sticker-image\" />\n                                </a>\n                            </div>\n                        </div>\n                    </div>\n                </div>                <div class=\"se-component se-text se-l-default\" id=\"SE-27DE2D2E-E950-4385-A9A4-02B14D409566\">\n                    <div class=\"se-component-content\">\n                        <div class=\"se-section se-section-text se-l-default\">\n                            <div class=\"se-module se-module-text\">\n                                    <!-- SE-TEXT { --><p class=\"se-text-paragraph se-text-paragraph-align-center \" style=\"\" id=\"SE-DDA3DBAD-0AD8-424A-8C9F-289F424D1832\"><span style=\"\" class=\"se-fs-fs15 se-ff-system   \" id=\"SE-82ED3215-3F6B-4C89-82BB-5AD006E9E8E2\">안뇽하세여 챠니입니다!!!! </span></p><!-- } SE-TEXT --><!-- SE-TEXT { --><p class=\"se-text-paragraph se-text-paragraph-align-center \" style=\"\" id=\"SE-1E00FF4C-02BC-4B72-9F67-7B172AF08475\"><span style=\"\" class=\"se-fs-fs15 se-ff-system   \" id=\"SE-197F3605-852B-40BD-BEED-097DE827DE11\">오늘 오후 9시에 롤 내전이 있어요!</span></p><!-- } SE-TEXT --><!-- SE-TEXT { --><p class=\"se-text-paragraph se-text-paragraph-align-center \" style=\"\" id=\"SE-FE32674C-2317-4832-92D6-1369AE9F1BE6\"><span style=\"\" class=\"se-fs-fs15 se-ff-system   \" id=\"SE-643E3999-198A-443E-98F4-83FB920B29F9\">멤버는 요렇게 된답니다~!!!</span></p><!-- } SE-TEXT --><!-- SE-TEXT { --><p class=\"se-text-paragraph se-text-paragraph-align-center \" style=\"\" id=\"SE-A3D9FFAE-BC11-454A-A5BC-6F626FD6E4FF\"><span style=\"\" class=\"se-fs-fs15 se-ff-system   \" id=\"SE-CE93A3D0-5ED3-4674-B35E-6DA4B05C3057\">​</span></p><!-- } SE-TEXT --><!-- SE-TEXT { --><p class=\"se-text-paragraph se-text-paragraph-align-center \" style=\"\" id=\"SE-2025C8DC-289D-43B3-8869-A426B3BAE71D\"><span style=\"\" class=\"se-fs-fs15 se-ff-system   \" id=\"SE-85A0059A-11DA-46A7-83BE-4D4350231D59\">짬타수아 / 박재박</span></p><!-- } SE-TEXT --><!-- SE-TEXT { --><p class=\"se-text-paragraph se-text-paragraph-align-center \" style=\"\" id=\"SE-D10A5A1B-BE52-4AA1-B365-183C41DBEDB1\"><span style=\"\" class=\"se-fs-fs15 se-ff-system   \" id=\"SE-F8A62D9C-0A1A-404A-A213-1CA44F6A738D\">천양 / 몽나</span></p><!-- } SE-TEXT --><!-- SE-TEXT { --><p class=\"se-text-paragraph se-text-paragraph-align-center \" style=\"\" id=\"SE-15AA4737-D323-4A1B-83A8-5A9488D992F7\"><span style=\"\" class=\"se-fs-fs15 se-ff-system   \" id=\"SE-3D73B0E2-12C1-4BB0-A3E8-5A71AE34EFE2\">우왁굳 / 빙밍</span></p><!-- } SE-TEXT --><!-- SE-TEXT { --><p class=\"se-text-paragraph se-text-paragraph-align-center \" style=\"\" id=\"SE-4D81CA8B-89D8-44ED-8EF5-C84880CD0173\"><span style=\"\" class=\"se-fs-fs15 se-ff-system   \" id=\"SE-F196E155-247F-43A4-A067-FA4143B66119\">비챤 / 설채이</span></p><!-- } SE-TEXT --><!-- SE-TEXT { --><p class=\"se-text-paragraph se-text-paragraph-align-center \" style=\"\" id=\"SE-D84C7BA9-56B1-4940-B7FC-AA1EBE80BC59\"><span style=\"\" class=\"se-fs-fs15 se-ff-system   \" id=\"SE-B1A0BA83-0151-4B1D-9AED-389491919EAD\">민결희 / 코렛트 </span></p><!-- } SE-TEXT --><!-- SE-TEXT { --><p class=\"se-text-paragraph se-text-paragraph-align-center \" style=\"\" id=\"SE-7FA6959E-67AA-4FB5-AC48-E8F51C5B2A97\"><span style=\"\" class=\"se-fs-fs15 se-ff-system   \" id=\"SE-CD3CBBF4-6978-4B43-A645-666A8CBD8B30\">​</span></p><!-- } SE-TEXT --><!-- SE-TEXT { --><p class=\"se-text-paragraph se-text-paragraph-align-center \" style=\"\" id=\"SE-2089251F-A33E-4281-BA0F-CAB6DF916FDA\"><span style=\"\" class=\"se-fs-fs15 se-ff-system   \" id=\"SE-F61D4170-8CBB-449B-9DC2-D748A830EB4D\">저는 몸 컨디션이 살짝 안좋아서 ㅠㅁ ㅠ</span></p><!-- } SE-TEXT --><!-- SE-TEXT { --><p class=\"se-text-paragraph se-text-paragraph-align-center \" style=\"\" id=\"SE-60C8B93B-E53A-4FF6-AE1F-C2B4F8F364BD\"><span style=\"\" class=\"se-fs-fs15 se-ff-system   \" id=\"SE-1F0928E0-C218-436C-8919-4136E8021757\">천천히 킬 예정입니다 헤헤.. </span></p><!-- } SE-TEXT --><!-- SE-TEXT { --><p class=\"se-text-paragraph se-text-paragraph-align-center \" style=\"\" id=\"SE-4F739782-B116-4316-804A-0AA8571F18AE\"><span style=\"\" class=\"se-fs-fs15 se-ff-system   \" id=\"SE-B22D3D44-79A9-4220-B6CF-6A1BDB444490\">9시에 본다 생각해주세용! </span></p><!-- } SE-TEXT --><!-- SE-TEXT { --><p class=\"se-text-paragraph se-text-paragraph-align-center \" style=\"\" id=\"SE-A98B829A-4FD6-48CD-BB2B-8D17712FFC14\"><span style=\"\" class=\"se-fs-fs15 se-ff-system   \" id=\"SE-3C374684-2237-4D96-9324-50399470664C\">이따 만나요!!! ☺️☺️💚💚</span></p><!-- } SE-TEXT -->\n                            </div>\n                        </div>\n                    </div>\n                    <script type=\"text/data\" class=\"__se_module_data\" data-module-v2='{\"type\": \"v2_text\", \"id\": \"SE-27DE2D2E-E950-4385-A9A4-02B14D409566\", \"data\": {\"ctype\": \"text\"  }}'></script>\n                </div>    </div>\n</div>\n",
      "customElements": [],
      "gdid": "90000004_01A8D98E014655D300000000",
      "replyListOrder": "",
      "isNotice": false,
      "isNewComment": true,
      "isDeleteParent": false,
      "isMarket": false,
      "isGroupPurchase": false,
      "isPersonalTrade": false,
      "isReposted": false,
      "isReadable": true,
      "isBlind": false,
      "isOpen": true,
      "isSearchOpen": true,
      "isEnableScrap": true,
      "scrapCount": 0,
      "isEnableExternal": true,
      "isEnableSocialPlugin": true,
      "isWriteComment": true,
      "isAutoSourcing": false
    },
    "comments": {
      "items": [
        {
          "id": 669592786,
          "refId": 669592786,
          "writer": {
            "memberKey": "HFDHjz0fRSM1nPT5r7RsPfSxQq-yAI9_lunaRSnYKf4",
            "baMemberKey": "a5674ce4e53a167e8ab861a4262ad3572ab9ce0ac04432ec385544910f626629",
            "nick": "인형쟈나이",
            "image": {
              "url": "https://cafeptthumb-phinf.pstatic.net/MjAyNDA0MDdfMTUg/MDAxNzEyNDgyNzA3NDY1.Z_R8Cmc2nL38bz6qiTlYN1iIgqYIkZ9viF2eY9cbfc8g._eV6yXFHsAYWzoo_F7A_i4Z1jAsg-C1MRRE-NA83J80g.JPEG/externalFile.jpg",
              "service": "CAFE",
              "type": "c77_77",
              "isAnimated": false
            },
            "activityBadges": []
          },
          "content": "챠나",
          "updateDate": 1769157250000,
          "memberLevel": 150,
          "memberLevelIconId": 1,
          "memberLevelName": "느그자",
          "cleanBotDetected": false,
          "bestComment": false,
          "isRef": false,
          "isDeleted": false,
          "isArticleWriter": false,
          "isNew": true,
          "isRemovable": false,
          "standardReportPopup": {
            "normalUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592786&ctitle=%EC%B1%A0%EB%82%98&cnickname=%EC%9D%B8%ED%98%95%EC%9F%88%EB%82%98%EC%9D%B4&dark=disable&env=mobile",
            "darkUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592786&ctitle=%EC%B1%A0%EB%82%98&cnickname=%EC%9D%B8%ED%98%95%EC%9F%88%EB%82%98%EC%9D%B4&dark=enable&env=mobile",
            "showRemoveAlert": false
          }
        },
        {
          "id": 669592796,
          "refId": 669592786,
          "writer": {
            "memberKey": "NrCiyiprzEmyRqvRjkTUpYdFnSBs8dQ1dZx33lkM7sM",
            "baMemberKey": "95ae86b2bc72f776acc5dd5910293e94a448d4dfad1d22e3d1fb291567059463",
            "nick": "둘강쥐",
            "image": {
              "url": "https://cafeptthumb-phinf.pstatic.net/MjAyNjAxMjBfODgg/MDAxNzY4ODkxNTYwMDgx.b_b6wNcZXSIbxjuhOGgyfR1j5BvSAHgDK_vO7I5sBN0g.ykNQWv8WoXqWneq7kzKQq2vvhY--R2MyZY6CXkhqUvMg.JPEG/externalFile.jpg",
              "service": "CAFE",
              "type": "c77_77",
              "isAnimated": false
            },
            "activityBadges": []
          },
          "content": "",
          "sticker": {
            "id": "ogq_614a347f4ae14-1-185-160",
            "packCode": "ogq_614a347f4ae14",
            "url": "https://storep-phinf.pstatic.net/ogq_614a347f4ae14/original_1.png",
            "type": "p100_100",
            "animation": false,
            "width": 129,
            "height": 112
          },
          "updateDate": 1769157266000,
          "memberLevel": 140,
          "memberLevelIconId": 1,
          "memberLevelName": "침팬치",
          "cleanBotDetected": false,
          "bestComment": false,
          "isRef": true,
          "isDeleted": false,
          "isArticleWriter": false,
          "isNew": true,
          "isRemovable": false,
          "standardReportPopup": {
            "normalUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592796&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%EB%91%98%EA%B0%95%EC%A5%90&dark=disable&env=mobile",
            "darkUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592796&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%EB%91%98%EA%B0%95%EC%A5%90&dark=enable&env=mobile",
            "showRemoveAlert": false
          }
        },
        {
          "id": 669592803,
          "refId": 669592786,
          "writer": {
            "memberKey": "P3JIKcKu4MQeJEJrLDntl1HfLh-5rxE7BykvHSkrPqo",
            "baMemberKey": "93cb21e20a2179824f02862e0069d17d1fa1fa5639c76c33484a6657be83ecf5",
            "nick": "하늘고란희",
            "image": {
              "url": "https://cafeptthumb-phinf.pstatic.net/MjAyNjAxMTdfMTAz/MDAxNzY4NjE5MTM4NjA4.QR3bQNZrTZ_jKEoTdrGzBlokx_y5U6y40uR6tn1awKgg.7jETx2L4fQaq473ww0prrp7IhjzQ9Q9JzZk5dfkTV3kg.JPEG/externalFile.jpg",
              "service": "CAFE",
              "type": "c77_77",
              "isAnimated": false
            },
            "activityBadges": []
          },
          "content": "",
          "sticker": {
            "id": "ogq_614a347f4ae14-1-185-160",
            "packCode": "ogq_614a347f4ae14",
            "url": "https://storep-phinf.pstatic.net/ogq_614a347f4ae14/original_1.png",
            "type": "p100_100",
            "animation": false,
            "width": 129,
            "height": 112
          },
          "updateDate": 1769157268000,
          "memberLevel": 110,
          "memberLevelIconId": 1,
          "memberLevelName": "진드기",
          "cleanBotDetected": false,
          "bestComment": false,
          "isRef": true,
          "isDeleted": false,
          "isArticleWriter": false,
          "isNew": true,
          "isRemovable": false,
          "standardReportPopup": {
            "normalUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592803&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%ED%95%98%EB%8A%98%EA%B3%A0%EB%9E%80%ED%9D%AC&dark=disable&env=mobile",
            "darkUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592803&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%ED%95%98%EB%8A%98%EA%B3%A0%EB%9E%80%ED%9D%AC&dark=enable&env=mobile",
            "showRemoveAlert": false
          }
        },
        {
          "id": 669592805,
          "refId": 669592786,
          "writer": {
            "memberKey": "V61r7Cile9fcahQh6JM2cQ",
            "baMemberKey": "ccb20f73bea89893bfa5888cf3bec2ecaee94ead1fb37525d25ceaf8f9beea0b",
            "nick": "영 식 이",
            "image": {
              "url": "https://cafeptthumb-phinf.pstatic.net/MjAyNTAyMTRfMTU4/MDAxNzM5NTIxNDIwOTUw.BuINNUAywwNc2Yt3ncZ6jTnXCYr45v9zKs-6m-rjliAg.eAI3yXVVwQKt0qIUFI1mn4IpF0wqlssjGjX9fDr5LNMg.PNG/%25EB%258A%2590%25EA%25B7%25B8%25EC%259E%25902.png",
              "service": "CAFE",
              "type": "c77_77",
              "isAnimated": false
            },
            "activityBadges": []
          },
          "content": "",
          "sticker": {
            "id": "ogq_593d7cb977138-1-185-160",
            "packCode": "ogq_593d7cb977138",
            "url": "https://storep-phinf.pstatic.net/ogq_593d7cb977138/original_1.png",
            "type": "p100_100",
            "animation": false,
            "width": 129,
            "height": 112
          },
          "updateDate": 1769157270000,
          "memberLevel": 150,
          "memberLevelIconId": 1,
          "memberLevelName": "느그자",
          "cleanBotDetected": false,
          "bestComment": false,
          "isRef": true,
          "isDeleted": false,
          "isArticleWriter": false,
          "isNew": true,
          "isRemovable": false,
          "standardReportPopup": {
            "normalUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592805&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%EC%98%81+%EC%8B%9D+%EC%9D%B4&dark=disable&env=mobile",
            "darkUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592805&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%EC%98%81+%EC%8B%9D+%EC%9D%B4&dark=enable&env=mobile",
            "showRemoveAlert": false
          }
        },
        {
          "id": 669592807,
          "refId": 669592786,
          "writer": {
            "memberKey": "hnMs46v_Lf1K8ZHvHLHy1cCUfIoJxwieZ8VW42mUS50",
            "baMemberKey": "e5b56047686993d7edc8ec6e49f1a937ec300274890b5bdfbfe2a176a669a3e2",
            "nick": "데빌군주",
            "activityBadges": []
          },
          "content": "",
          "sticker": {
            "id": "ogq_635caf80c65a6-1-185-160",
            "packCode": "ogq_635caf80c65a6",
            "url": "https://storep-phinf.pstatic.net/ogq_635caf80c65a6/original_1.png",
            "type": "p100_100",
            "animation": false,
            "width": 129,
            "height": 112
          },
          "updateDate": 1769157272000,
          "memberLevel": 140,
          "memberLevelIconId": 1,
          "memberLevelName": "침팬치",
          "cleanBotDetected": false,
          "bestComment": false,
          "isRef": true,
          "isDeleted": false,
          "isArticleWriter": false,
          "isNew": true,
          "isRemovable": false,
          "standardReportPopup": {
            "normalUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592807&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%EB%8D%B0%EB%B9%8C%EA%B5%B0%EC%A3%BC&dark=disable&env=mobile",
            "darkUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592807&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%EB%8D%B0%EB%B9%8C%EA%B5%B0%EC%A3%BC&dark=enable&env=mobile",
            "showRemoveAlert": false
          }
        },
        {
          "id": 669592830,
          "refId": 669592786,
          "writer": {
            "memberKey": "6G1Aof5OtaiEjUCn0wGPJaOG8KBa-QH2pQGjvIwbCS0",
            "baMemberKey": "0e4b6c3e16d9dd4ba9b565c3e0f466df5ac0152fd3af8dcb964f09305f488360",
            "nick": "석봉짱",
            "image": {
              "url": "https://cafeptthumb-phinf.pstatic.net/MjAyNTEyMTFfMTE2/MDAxNzY1NDMzOTY0MTgx.VfHTVBx8L9dK2PP-kZSwf0dnp5hEuvYfxvdGifCTwO8g.raP0c8sacnel_cEv3SQRbqo_RjpMqpgB7TaJpjkfjEsg.JPEG/externalFile.jpeg",
              "service": "CAFE",
              "type": "c77_77",
              "isAnimated": false
            },
            "activityBadges": []
          },
          "content": "",
          "sticker": {
            "id": "ogq_614a347f4ae14-1-185-160",
            "packCode": "ogq_614a347f4ae14",
            "url": "https://storep-phinf.pstatic.net/ogq_614a347f4ae14/original_1.png",
            "type": "p100_100",
            "animation": false,
            "width": 129,
            "height": 112
          },
          "updateDate": 1769157282000,
          "memberLevel": 150,
          "memberLevelIconId": 1,
          "memberLevelName": "느그자",
          "cleanBotDetected": false,
          "bestComment": false,
          "isRef": true,
          "isDeleted": false,
          "isArticleWriter": false,
          "isNew": true,
          "isRemovable": false,
          "standardReportPopup": {
            "normalUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592830&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%EC%84%9D%EB%B4%89%EC%A7%B1&dark=disable&env=mobile",
            "darkUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592830&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%EC%84%9D%EB%B4%89%EC%A7%B1&dark=enable&env=mobile",
            "showRemoveAlert": false
          }
        },
        {
          "id": 669592835,
          "refId": 669592786,
          "writer": {
            "memberKey": "LsljBVivadgdVomhTdOJ12sFyzdMSOL9AXcT_BoF8JY",
            "baMemberKey": "d7be65344d5d3a926418b5ba1207d19e38910cdf9929aaa5ac1c022dfdb242f0",
            "nick": "리브 lib",
            "image": {
              "url": "https://cafeptthumb-phinf.pstatic.net/MjAyNjAxMDlfMzgg/MDAxNzY3OTMwNTczMzY4.SsgD_kpBHW_ks-GNNR4LwFhbKAjjANxgtGtAAM2l2gwg.p8yJQAl_ebw_6PAHYqDDRELfQS1MLzFNc8luimafhYog.JPEG/externalFile.jpg",
              "service": "CAFE",
              "type": "c77_77",
              "isAnimated": false
            },
            "activityBadges": []
          },
          "content": "",
          "sticker": {
            "id": "ogq_614a347f4ae14-1-185-160",
            "packCode": "ogq_614a347f4ae14",
            "url": "https://storep-phinf.pstatic.net/ogq_614a347f4ae14/original_1.png",
            "type": "p100_100",
            "animation": false,
            "width": 129,
            "height": 112
          },
          "updateDate": 1769157283000,
          "memberLevel": 150,
          "memberLevelIconId": 1,
          "memberLevelName": "느그자",
          "cleanBotDetected": false,
          "bestComment": false,
          "isRef": true,
          "isDeleted": false,
          "isArticleWriter": false,
          "isNew": true,
          "isRemovable": false,
          "standardReportPopup": {
            "normalUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592835&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%EB%A6%AC%EB%B8%8C+lib&dark=disable&env=mobile",
            "darkUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592835&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%EB%A6%AC%EB%B8%8C+lib&dark=enable&env=mobile",
            "showRemoveAlert": false
          }
        },
        {
          "id": 669592967,
          "refId": 669592786,
          "writer": {
            "memberKey": "L-pp18PiMQXaK506D47CPSxXIK7kP1Z9aR6iOd-N6sc",
            "baMemberKey": "c34e2f8b664fab7cbb3529cfc4aabb34ed29b465366aea3a1a54ee8e982ef058",
            "nick": "0센타우루스0",
            "image": {
              "url": "https://cafeptthumb-phinf.pstatic.net/MjAyNjAxMTJfMjQy/MDAxNzY4MTcwNjE0MzE0.gDuiavKD9Et3GMdb44AfH4sxnqIFXlAtRyYrb2lDIJQg.gOhpPPosVCvSY6r2Gtuncu0ld10GxYd0cYBvF3nqMccg.PNG/%25EC%25B9%2598%25EC%2597%2590.png",
              "service": "CAFE",
              "type": "c77_77",
              "isAnimated": false
            },
            "activityBadges": []
          },
          "content": "",
          "sticker": {
            "id": "ogq_614a347f4ae14-1-185-160",
            "packCode": "ogq_614a347f4ae14",
            "url": "https://storep-phinf.pstatic.net/ogq_614a347f4ae14/original_1.png",
            "type": "p100_100",
            "animation": false,
            "width": 129,
            "height": 112
          },
          "updateDate": 1769157366000,
          "memberLevel": 130,
          "memberLevelIconId": 1,
          "memberLevelName": "왁무새",
          "cleanBotDetected": false,
          "bestComment": false,
          "isRef": true,
          "isDeleted": false,
          "isArticleWriter": false,
          "isNew": true,
          "isRemovable": false,
          "standardReportPopup": {
            "normalUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592967&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=0%EC%84%BC%ED%83%80%EC%9A%B0%EB%A3%A8%EC%8A%A40&dark=disable&env=mobile",
            "darkUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592967&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=0%EC%84%BC%ED%83%80%EC%9A%B0%EB%A3%A8%EC%8A%A40&dark=enable&env=mobile",
            "showRemoveAlert": false
          }
        },
        {
          "id": 669592802,
          "refId": 669592802,
          "writer": {
            "memberKey": "A_quBJnnn0eohvKq-tR1OlHErU0WIZ2zPkMO4s4AXEA",
            "baMemberKey": "14df32b64c03fd44db1e361a3a89a05d4cd81416e33ce489cff9fdbb1293442d",
            "nick": "아르비나",
            "image": {
              "url": "https://cafeptthumb-phinf.pstatic.net/MjAyNTA4MDhfNDMg/MDAxNzU0NTg3Mjc3NjA5.bRu9a9zXep1xWy52VwMbS1pxuL2Ubd8wEhSS8Cpsjdkg.CPZi1LDjfnaOoG0fRjCB1UoZlX1eylmz23ENTbLPf18g.JPEG/externalFile.jpeg",
              "service": "CAFE",
              "type": "c77_77",
              "isAnimated": false
            },
            "activityBadges": []
          },
          "content": "",
          "sticker": {
            "id": "ogq_614a347f4ae14-1-185-160",
            "packCode": "ogq_614a347f4ae14",
            "url": "https://storep-phinf.pstatic.net/ogq_614a347f4ae14/original_1.png",
            "type": "p100_100",
            "animation": false,
            "width": 129,
            "height": 112
          },
          "updateDate": 1769157268000,
          "memberLevel": 150,
          "memberLevelIconId": 1,
          "memberLevelName": "느그자",
          "cleanBotDetected": false,
          "bestComment": false,
          "isRef": false,
          "isDeleted": false,
          "isArticleWriter": false,
          "isNew": true,
          "isRemovable": false,
          "standardReportPopup": {
            "normalUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592802&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%EC%95%84%EB%A5%B4%EB%B9%84%EB%82%98&dark=disable&env=mobile",
            "darkUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592802&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%EC%95%84%EB%A5%B4%EB%B9%84%EB%82%98&dark=enable&env=mobile",
            "showRemoveAlert": false
          }
        },
        {
          "id": 669592806,
          "refId": 669592806,
          "writer": {
            "memberKey": "o0QYmQ1QzoyIlEaWJMhjdBDIH32j3XIGU532RtTHRjU",
            "baMemberKey": "88efc3105f513b8a6ddadf13d6078d938530d41ab38a30cbfa0a6b9688bd0987",
            "nick": "은하고양이",
            "image": {
              "url": "https://cafeptthumb-phinf.pstatic.net/MjAyNTExMTRfNTcg/MDAxNzYzMTI5OTgyMzA1.dzbmWMifC38ryUzXQC3YgZSE-AzA4JyIwUol5LSYsdMg.66_sZKZ0MVPVNTBCMtA4byUDczi6OB5_i93MgEV5gAEg.JPEG/externalFile.jpg",
              "service": "CAFE",
              "type": "c77_77",
              "isAnimated": false
            },
            "activityBadges": []
          },
          "content": "",
          "sticker": {
            "id": "ogq_614a347f4ae14-1-185-160",
            "packCode": "ogq_614a347f4ae14",
            "url": "https://storep-phinf.pstatic.net/ogq_614a347f4ae14/original_1.png",
            "type": "p100_100",
            "animation": false,
            "width": 129,
            "height": 112
          },
          "updateDate": 1769157270000,
          "memberLevel": 150,
          "memberLevelIconId": 1,
          "memberLevelName": "느그자",
          "cleanBotDetected": false,
          "bestComment": false,
          "isRef": false,
          "isDeleted": false,
          "isArticleWriter": false,
          "isNew": true,
          "isRemovable": false,
          "standardReportPopup": {
            "normalUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592806&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%EC%9D%80%ED%95%98%EA%B3%A0%EC%96%91%EC%9D%B4&dark=disable&env=mobile",
            "darkUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA12&cid=27842958;21386707;669592806&ctitle=%28%EC%8A%A4%ED%8B%B0%EC%BB%A4%29&cnickname=%EC%9D%80%ED%95%98%EA%B3%A0%EC%96%91%EC%9D%B4&dark=enable&env=mobile",
            "showRemoveAlert": false
          }
        }
      ],
      "next": {
        "id": 669592811,
        "refId": 669592811
      },
      "last": {
        "id": 669593214,
        "refId": 669593214
      },
      "alarm": {
        "isShow": false,
        "isChecked": false
      },
      "disableWriteReason": ""
    },
    "advert": {
      "type": "DA",
      "daAdvertUnitId": "m_cafe",
      "daAdvertDivId": "DaAdvert"
    },
    "cafe": {
      "id": 27842958,
      "name": "왁물원",
      "pcCafeName": "왁물원 :: 종합 거시기 스트리머 우왁굳 팬카페",
      "url": "steamindiegame",
      "image": {
        "url": "https://cafeptthumb-phinf.pstatic.net/MjAyMDA5MDZfNjAg/MDAxNTk5Mzg4MjkyNDc5.NZt2bTbWiv9S1ngf1dBJPqPuvATqAl7-2DQRKXGai3sg.6ay8eH5t9hWBhhrX5SjGmkln2mfMRNPQLePI-zV830Yg.PNG/image.png",
        "service": "CAFE",
        "type": "f100_100"
      },
      "introduction": "우왁굳 방송을 100배 더 재밌게 즐기는 방법",
      "memberCount": 583428,
      "hasPopularArticle": true,
      "usingMemberLevel": true,
      "memberLevelIconId": 1,
      "openType": "O",
      "isDormant": false
    },
    "user": {
      "memberKey": "h8YzbL2KkXHz1vKKGfYHtA",
      "baMemberKey": "",
      "nick": "",
      "image": {
        "url": "https://ssl.pstatic.net/static/cafe/cafe_pc/default/cafe_profile_77.png",
        "service": "CAFE",
        "type": "c77_77"
      },
      "memberLevel": 0,
      "blockMemberKeyList": [],
      "memberLevelName": "",
      "memberLevelIconUrl": "",
      "appliedAlready": false,
      "permission": {
        "isBoardStaff": false,
        "isOnlyOptionalBoardStaff": false,
        "isActivityStopExecutable": false,
        "isNoticeRegistrable": false,
        "isViceManager": false,
        "isCafeManager": false,
        "isEntireBoardStaff": false,
        "isMemberStaff": false
      },
      "isCafeMember": false,
      "isLogin": false,
      "isOwner": false,
      "isGroupId": false,
      "isBelowAge14": true
    },
    "attaches": [],
    "tags": [],
    "authority": {
      "isRightClick": true,
      "isShowReply": false,
      "isWriteReply": false,
      "isWrite": false,
      "isModify": false,
      "isRemove": false,
      "isMove": false,
      "isRepost": false,
      "isReport": false,
      "isShowStatistics": false,
      "isWriteComment": true,
      "isSharable": true,
      "isHeadModifiable": false,
      "isEnableAttachFileDownload": true
    },
    "editorVersion": "SE_ONE_V5",
    "readOnlyModeInfo": {
      "readOnlyModeStatus": false,
      "timeToPreNotice": false,
      "timeToNotice": false,
      "emergency": false,
      "readOnlyNoticeDuration": "",
      "linkToNoticeURL": "https://notice.naver.com/notices/cafe/28106"
    },
    "articleRegion": {
      "rcode": "",
      "type": "DOMESTIC",
      "name": "",
      "regionCode1": "",
      "regionName1": "",
      "regionCode2": "",
      "regionName2": "",
      "regionCode3": "",
      "regionName3": ""
    },
    "standardReportPopup": {
      "normalUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA11&ctitle=%5B%EB%B9%84%EC%B1%A4%5D+%EC%B1%A0%EB%8B%88%EB%8B%A4%21%21%21%21%21%21%21%21&cnickname=%EB%B9%84%EC%B1%A4&cid=27842958;21386707&dark=disable&env=mobile",
      "darkUrl": "https://srp2.naver.com/report?exit=close&svc=CAF&vsvc=CAF&rcountry=KR&rlang=ko&memtype=Y&ctype=AA11&ctitle=%5B%EB%B9%84%EC%B1%A4%5D+%EC%B1%A0%EB%8B%88%EB%8B%A4%21%21%21%21%21%21%21%21&cnickname=%EB%B9%84%EC%B1%A4&cid=27842958;21386707&dark=enable&env=mobile",
      "showRemoveAlert": false
    },
    "commAdSupport": true,
    "cafeStatList": [
      "스타가 가입한 카페예요",
      "최근 일주일 동안 337명이 가입했어요",
      "가입하면 1,555.4만개의 글을 볼 수 있어요",
      "어제 1.9만명이 방문했어요"
    ],
    "isReadOnlyMode": false,
    "isW800": true
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» result|object|true|none||none|
|»» cafeId|integer|true|none||none|
|»» articleId|integer|true|none||none|
|»» pageId|string|true|none||none|
|»» pageGroupId|string|true|none||none|
|»» heads|[string]|true|none||none|
|»» article|object|true|none||none|
|»»» id|integer|true|none||none|
|»»» refArticleId|integer|true|none||none|
|»»» menu|object|true|none||none|
|»»»» id|integer|true|none||none|
|»»»» name|string|true|none||none|
|»»»» menuType|string|true|none||none|
|»»»» boardType|string|true|none||none|
|»»»» badMenu|boolean|true|none||none|
|»»»» badMenuByRestrict|boolean|true|none||none|
|»»» subject|string|true|none||none|
|»»» writer|object|true|none||none|
|»»»» memberKey|string|true|none||none|
|»»»» baMemberKey|string|true|none||none|
|»»»» nick|string|true|none||none|
|»»»» image|object|true|none||none|
|»»»»» url|string|true|none||none|
|»»»»» service|string|true|none||none|
|»»»»» type|string|true|none||none|
|»»»»» isAnimated|boolean|true|none||none|
|»»»» memberLevel|integer|true|none||none|
|»»»» memberLevelName|string|true|none||none|
|»»»» memberLevelIconUrl|string|true|none||none|
|»»»» currentPopularMember|boolean|true|none||none|
|»»»» allowMemberAlarm|boolean|true|none||none|
|»»»» isCafeMember|boolean|true|none||none|
|»»» subscribeWriter|object|true|none||none|
|»»»» subscribe|boolean|true|none||none|
|»»»» push|boolean|true|none||none|
|»»» writeDate|integer|true|none||none|
|»»» readCount|integer|true|none||none|
|»»» commentCount|integer|true|none||none|
|»»» decorator|object|true|none||none|
|»»»» isShowSuicideSaver|boolean|true|none||none|
|»»»» isPlug|boolean|true|none||none|
|»»» existScrapAddContent|boolean|true|none||none|
|»»» template|object|true|none||none|
|»»»» isUse|boolean|true|none||none|
|»»» contentHtml|string|true|none||none|
|»»» customElements|[string]|true|none||none|
|»»» gdid|string|true|none||none|
|»»» replyListOrder|string|true|none||none|
|»»» isNotice|boolean|true|none||none|
|»»» isNewComment|boolean|true|none||none|
|»»» isDeleteParent|boolean|true|none||none|
|»»» isMarket|boolean|true|none||none|
|»»» isGroupPurchase|boolean|true|none||none|
|»»» isPersonalTrade|boolean|true|none||none|
|»»» isReposted|boolean|true|none||none|
|»»» isReadable|boolean|true|none||none|
|»»» isBlind|boolean|true|none||none|
|»»» isOpen|boolean|true|none||none|
|»»» isSearchOpen|boolean|true|none||none|
|»»» isEnableScrap|boolean|true|none||none|
|»»» scrapCount|integer|true|none||none|
|»»» isEnableExternal|boolean|true|none||none|
|»»» isEnableSocialPlugin|boolean|true|none||none|
|»»» isWriteComment|boolean|true|none||none|
|»»» isAutoSourcing|boolean|true|none||none|
|»» comments|object|true|none||none|
|»»» items|[object]|true|none||none|
|»»»» id|integer|true|none||none|
|»»»» refId|integer|true|none||none|
|»»»» writer|object|true|none||none|
|»»»»» memberKey|string|true|none||none|
|»»»»» baMemberKey|string|true|none||none|
|»»»»» nick|string|true|none||none|
|»»»»» image|object|true|none||none|
|»»»»»» url|string|true|none||none|
|»»»»»» service|string|true|none||none|
|»»»»»» type|string|true|none||none|
|»»»»»» isAnimated|boolean|true|none||none|
|»»»»» activityBadges|[string]|true|none||none|
|»»»» content|string|true|none||none|
|»»»» updateDate|integer|true|none||none|
|»»»» memberLevel|integer|true|none||none|
|»»»» memberLevelIconId|integer|true|none||none|
|»»»» memberLevelName|string|true|none||none|
|»»»» cleanBotDetected|boolean|true|none||none|
|»»»» bestComment|boolean|true|none||none|
|»»»» isRef|boolean|true|none||none|
|»»»» isDeleted|boolean|true|none||none|
|»»»» isArticleWriter|boolean|true|none||none|
|»»»» isNew|boolean|true|none||none|
|»»»» isRemovable|boolean|true|none||none|
|»»»» standardReportPopup|object|true|none||none|
|»»»»» normalUrl|string|true|none||none|
|»»»»» darkUrl|string|true|none||none|
|»»»»» showRemoveAlert|boolean|true|none||none|
|»»»» sticker|object|true|none||none|
|»»»»» id|string|true|none||none|
|»»»»» packCode|string|true|none||none|
|»»»»» url|string|true|none||none|
|»»»»» type|string|true|none||none|
|»»»»» animation|boolean|true|none||none|
|»»»»» width|integer|true|none||none|
|»»»»» height|integer|true|none||none|
|»»» next|object|true|none||none|
|»»»» id|integer|true|none||none|
|»»»» refId|integer|true|none||none|
|»»» last|object|true|none||none|
|»»»» id|integer|true|none||none|
|»»»» refId|integer|true|none||none|
|»»» alarm|object|true|none||none|
|»»»» isShow|boolean|true|none||none|
|»»»» isChecked|boolean|true|none||none|
|»»» disableWriteReason|string|true|none||none|
|»» advert|object|true|none||none|
|»»» type|string|true|none||none|
|»»» daAdvertUnitId|string|true|none||none|
|»»» daAdvertDivId|string|true|none||none|
|»» cafe|object|true|none||none|
|»»» id|integer|true|none||none|
|»»» name|string|true|none||none|
|»»» pcCafeName|string|true|none||none|
|»»» url|string|true|none||none|
|»»» image|object|true|none||none|
|»»»» url|string|true|none||none|
|»»»» service|string|true|none||none|
|»»»» type|string|true|none||none|
|»»» introduction|string|true|none||none|
|»»» memberCount|integer|true|none||none|
|»»» hasPopularArticle|boolean|true|none||none|
|»»» usingMemberLevel|boolean|true|none||none|
|»»» memberLevelIconId|integer|true|none||none|
|»»» openType|string|true|none||none|
|»»» isDormant|boolean|true|none||none|
|»» user|object|true|none||none|
|»»» memberKey|string|true|none||none|
|»»» baMemberKey|string|true|none||none|
|»»» nick|string|true|none||none|
|»»» image|object|true|none||none|
|»»»» url|string|true|none||none|
|»»»» service|string|true|none||none|
|»»»» type|string|true|none||none|
|»»» memberLevel|integer|true|none||none|
|»»» blockMemberKeyList|[string]|true|none||none|
|»»» memberLevelName|string|true|none||none|
|»»» memberLevelIconUrl|string|true|none||none|
|»»» appliedAlready|boolean|true|none||none|
|»»» permission|object|true|none||none|
|»»»» isBoardStaff|boolean|true|none||none|
|»»»» isOnlyOptionalBoardStaff|boolean|true|none||none|
|»»»» isActivityStopExecutable|boolean|true|none||none|
|»»»» isNoticeRegistrable|boolean|true|none||none|
|»»»» isViceManager|boolean|true|none||none|
|»»»» isCafeManager|boolean|true|none||none|
|»»»» isEntireBoardStaff|boolean|true|none||none|
|»»»» isMemberStaff|boolean|true|none||none|
|»»» isCafeMember|boolean|true|none||none|
|»»» isLogin|boolean|true|none||none|
|»»» isOwner|boolean|true|none||none|
|»»» isGroupId|boolean|true|none||none|
|»»» isBelowAge14|boolean|true|none||none|
|»» attaches|[string]|true|none||none|
|»» tags|[string]|true|none||none|
|»» authority|object|true|none||none|
|»»» isRightClick|boolean|true|none||none|
|»»» isShowReply|boolean|true|none||none|
|»»» isWriteReply|boolean|true|none||none|
|»»» isWrite|boolean|true|none||none|
|»»» isModify|boolean|true|none||none|
|»»» isRemove|boolean|true|none||none|
|»»» isMove|boolean|true|none||none|
|»»» isRepost|boolean|true|none||none|
|»»» isReport|boolean|true|none||none|
|»»» isShowStatistics|boolean|true|none||none|
|»»» isWriteComment|boolean|true|none||none|
|»»» isSharable|boolean|true|none||none|
|»»» isHeadModifiable|boolean|true|none||none|
|»»» isEnableAttachFileDownload|boolean|true|none||none|
|»» editorVersion|string|true|none||none|
|»» readOnlyModeInfo|object|true|none||none|
|»»» readOnlyModeStatus|boolean|true|none||none|
|»»» timeToPreNotice|boolean|true|none||none|
|»»» timeToNotice|boolean|true|none||none|
|»»» emergency|boolean|true|none||none|
|»»» readOnlyNoticeDuration|string|true|none||none|
|»»» linkToNoticeURL|string|true|none||none|
|»» articleRegion|object|true|none||none|
|»»» rcode|string|true|none||none|
|»»» type|string|true|none||none|
|»»» name|string|true|none||none|
|»»» regionCode1|string|true|none||none|
|»»» regionName1|string|true|none||none|
|»»» regionCode2|string|true|none||none|
|»»» regionName2|string|true|none||none|
|»»» regionCode3|string|true|none||none|
|»»» regionName3|string|true|none||none|
|»» standardReportPopup|object|true|none||none|
|»»» normalUrl|string|true|none||none|
|»»» darkUrl|string|true|none||none|
|»»» showRemoveAlert|boolean|true|none||none|
|»» commAdSupport|boolean|true|none||none|
|»» cafeStatList|[string]|true|none||none|
|»» isReadOnlyMode|boolean|true|none||none|
|»» isW800|boolean|true|none||none|

## GET 查询指定栏目帖子列表

GET /cafe-web/cafe-boardlist-api/v1/cafes/27842958/menus/345/articles

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|page|query|string| 否 |none|
|pageSize|query|string| 否 |none|
|sortBy|query|string| 否 |none|
|viewType|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "result": {
    "articleList": [
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21386707,
          "cafeId": 27842958,
          "refArticleId": 21386707,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "Q6r9zdooAwLOTayf7c917g",
            "nickName": "비챤",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[비챤] 챠니다!!!!!!!!",
          "writeDateTimestamp": 1769157243373,
          "summary": "안뇽하세여 챠니입니다!!!! \n오늘 오후 9시에 롤 내전이 있어요!\n멤버는 요렇게 된답니다~!!!\n짬타수아 / 박재박\n천양 / 몽나\n우왁굳 / 빙밍\n비챤 / 설채이\n민결희 / 코렛트 \n저는 몸 컨디션이 살짝 안좋아서 ㅠㅁ ㅠ\n천천히 킬 예정입니다 헤헤.. \n9시에 본다 생각해주세용! \n이따 만나요!!! ☺️☺️💚💚",
          "blindArticle": false,
          "commentCount": 153,
          "readCount": 1808,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": false,
          "hasLink": false,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 649,
          "liked": false,
          "newArticle": true,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      },
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21386634,
          "cafeId": 27842958,
          "refArticleId": 21386634,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "VLprTFWwjnkYxKqwN7exspDm4Jyqu_sB_kxlOWmDyTA",
            "nickName": "고세구",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[고세구] 오늘 휴뱅입니다 ㅠ",
          "writeDateTimestamp": 1769155559643,
          "summary": "컨디션 이슈로 휴뱅입니다 ㅠㅁㅠ...!",
          "blindArticle": false,
          "commentCount": 219,
          "readCount": 2274,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": false,
          "hasLink": false,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 831,
          "liked": false,
          "newArticle": true,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      },
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21384833,
          "cafeId": 27842958,
          "refArticleId": 21384833,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "VLprTFWwjnkYxKqwN7exspDm4Jyqu_sB_kxlOWmDyTA",
            "nickName": "고세구",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[고세구] 쇠구컵 2026 경매 관련 공지",
          "writeDateTimestamp": 1769084783543,
          "summary": "쇠구컵 2026 드래프트 공지\n드래프트 진행 일자\n2026년 1월 25일 저녁 9시 30분\n드래프트 방식\n1. 경매로 진행\n2. 감독분들 필참으로 디스코드 진행\n3. 고세구 화면 공유 보며 진행\n경매 방식\n1. 선수 경매 순서는 올랜덤으로 진행\n2. 감독님은 1000골드를 소지하고 시작\n3. 한 팀당 골드 티어는 1인만 선택 가능합니다\n4. 한 팀당 라인당 1인만 선택 가능합니다\n(ex. 정글 2인 선택 불가)\n단, 팀 구성 완료 후 팀 내에서 포지션 스왑은 가능\n5. 먼저 골드 소진 시,\n타감독들이 골드를 모두 소진하거나,\n...",
          "blindArticle": false,
          "commentCount": 151,
          "readCount": 5387,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": false,
          "hasLink": false,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 1021,
          "liked": false,
          "newArticle": true,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      },
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21384828,
          "cafeId": 27842958,
          "refArticleId": 21384828,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "VLprTFWwjnkYxKqwN7exspDm4Jyqu_sB_kxlOWmDyTA",
            "nickName": "고세구",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "headId": 0,
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[고세구] 쇠구컵 2026 참가 선수단 명단 공개",
          "writeDateTimestamp": 1769084739190,
          "representImage": "https://cafeptthumb-phinf.pstatic.net/MjAyNjAxMjJfNjIg/MDAxNzY5MDg0NzA2OTA3._WPadZUvGHfkB6zg5Iw4DZEo8Li-T1bn_MKEMnKr1F0g.Yehu16HLW-HIpKltbSwPb7cw_JSdvzA_ub7n3K2Jqy4g.PNG/e7591f4b69b57aed.png",
          "representImageType": "I",
          "summary": "쇠구컵 2026 선수 합격자 공지\n⚠️합격자 필독⚠️\n합격자분들은 디스코드 서버 초대를 위해\ntherrrr45@naver.com 메일로\n디스코드 아이디 보내주시면,\n스태프 테르님이 디코 친추 보내드릴 예정입니다!\n(이미 테르님과 친추 되어 계신 분은 안 보내주셔도 됩니다)\n꼭 확인하셔서 서버 접속을 되도록 내일(23일)까지 마쳐주세요\n서버에 들어오신 후 자유롭게\n참가 선수분들끼리 스크림이 가능합니다\n🔥감독 필독🔥\n쇠구컵 디스코드 서버 공지에\n참가 선수 명단 시트를 올려두었습니다!\n함께 올리는 경매 공지도 필독해주세요!\n🤚...",
          "blindArticle": false,
          "commentCount": 155,
          "readCount": 6662,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": true,
          "hasLink": false,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 957,
          "liked": false,
          "newArticle": true,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      },
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21384762,
          "cafeId": 27842958,
          "refArticleId": 21384762,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "l9iJSgswwB8TEtdfSWWV5HZqVwuYeenLwqD5uZSTZgo",
            "nickName": "주르르",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[주르르] 아이고 미안합니다 ㅜㅜ",
          "writeDateTimestamp": 1769083458510,
          "summary": "내일까지 끝내야하는 중요한 일이 있었는데\n못끝냈다는 사실을 까묵고 있었어욥.. ㅠㅠㅠㅠㅠ\n오늘 업무를 봐야할게 많을 거 같아서 휴방으루 변경됐숩니다..!\n내일 뵙겠습니닷 죄송해용 ! ㅜ.ㅜ",
          "blindArticle": false,
          "commentCount": 263,
          "readCount": 4913,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": false,
          "hasLink": false,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 1274,
          "liked": false,
          "newArticle": true,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      },
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21384671,
          "cafeId": 27842958,
          "refArticleId": 21384671,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "_t7qKbepQAqUXL6u1UN5YIOMae_nojNqjXtqshK8GDc",
            "nickName": "릴파 LILPA",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[릴파] 휴뱅입니드아",
          "writeDateTimestamp": 1769080900890,
          "summary": "오늘 내일 휴뱅하구!!\n토요일 만케치북으로 찾아뵐것같숩니당!!\n목관리겸 컨디션관리 들어가겠숩니당!\n(물론 중간중간 일은 해야겠지만..)\n토요일날 만식님 방송에서 봐요~!!",
          "blindArticle": false,
          "commentCount": 215,
          "readCount": 3371,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": false,
          "hasLink": false,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 1154,
          "liked": false,
          "newArticle": true,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      },
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21384368,
          "cafeId": 27842958,
          "refArticleId": 21384368,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "l9iJSgswwB8TEtdfSWWV5HZqVwuYeenLwqD5uZSTZgo",
            "nickName": "주르르",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[주르르] 콘르르 쫀득 쿠키 시키신분",
          "writeDateTimestamp": 1769074413850,
          "representImage": "https://cafeptthumb-phinf.pstatic.net/MjAyNjAxMjJfMjg5/MDAxNzY5MDc0NDEzMjUz.nZZ8TaCWprds2JgwMgTzXUFYce1E60IhRa6TXAYHwXog.Q84f5_Y0_h1U5XJUUc_CZQl7m8IkvlybgH9kv6fyanAg.PNG/1768814215.33852.png",
          "representImageType": "I",
          "summary": "와하항항\n오늘 오뱅있입니다~~~!!!\n마라탕 갑자기 넘 땡겨서 시켜버림..!!!\n마라탕 먹고 올게요옹>.<\n이따 봐욥!!!!",
          "blindArticle": false,
          "commentCount": 241,
          "readCount": 5655,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": true,
          "hasLink": false,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 1434,
          "liked": false,
          "newArticle": true,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      },
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21384244,
          "cafeId": 27842958,
          "refArticleId": 21384244,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "eeFErgAPJ5NYt4iDaRf1FA",
            "nickName": "아이네",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[아이네] 앗! 휴뱅",
          "writeDateTimestamp": 1769072653130,
          "summary": "악\n스튜디오를 못가게되었습니다 흑흑\n내일봐요!!!!!!!",
          "blindArticle": false,
          "commentCount": 310,
          "readCount": 5118,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": false,
          "hasLink": false,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 1536,
          "liked": false,
          "newArticle": true,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      },
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21381489,
          "cafeId": 27842958,
          "refArticleId": 21381489,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "eeFErgAPJ5NYt4iDaRf1FA",
            "nickName": "아이네",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[아이네] 이따가봐요잉",
          "writeDateTimestamp": 1768989850687,
          "representImage": "https://cafeptthumb-phinf.pstatic.net/MjAyNjAxMjFfMTUy/MDAxNzY4OTg5NzIzODky.Kg25OR-FN0nbhNV0sugbJavyEJBg4ACBwwBEqExk4o8g.-sZLIiaDDK41dgZ8y4rOglF3TXVisyywsJ7oMrk6oUMg.PNG/%25EC%259D%25BC%25EB%259F%25AC%25EC%258A%25A4%25ED%258A%25B8328.png",
          "representImageType": "I",
          "summary": "하이이이이\n아가컵 관련 공지와 정리 좀 하고\n아이봤 조금이라도 보겠씀미다\n앞으로는 방송에서 밀리기전에 왕짧게라도 아이봤을 쫌씩 볼까 함미댜\n그래서 언제보냐고 안물어보게!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n이따가봐용!!!",
          "blindArticle": false,
          "commentCount": 249,
          "readCount": 7048,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": true,
          "hasLink": false,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 1677,
          "liked": false,
          "newArticle": false,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      },
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21381330,
          "cafeId": 27842958,
          "refArticleId": 21381330,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "VLprTFWwjnkYxKqwN7exspDm4Jyqu_sB_kxlOWmDyTA",
            "nickName": "고세구",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[고세구] 와 미쳤다",
          "writeDateTimestamp": 1768988791760,
          "summary": "미쳤어요 진심 미쳤어요 날씨가! 샤갈!\n이거 진짜 미친거 아니에요 (진심 날라갈 뻔했어요 속삭속삭)\n다들 감기 조심하세요 따뜻한 물 드링킹!\n오늘은 8시에 같이 게임할 예정이라 7시쯤 뱅온 하겠스빈다! ^ㅁ^\n헤헤 11시쯤엔 촬영 준비하러 나가봐야할 것 같아요 ㅠㅁㅠ!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
          "blindArticle": false,
          "commentCount": 208,
          "readCount": 7768,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": true,
          "hasLink": false,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 1467,
          "liked": false,
          "newArticle": false,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      },
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21381322,
          "cafeId": 27842958,
          "refArticleId": 21381322,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "_t7qKbepQAqUXL6u1UN5YIOMae_nojNqjXtqshK8GDc",
            "nickName": "릴파 LILPA",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[릴파] 릴파도 스트레스 많이 받을거야",
          "writeDateTimestamp": 1768988745997,
          "summary": "스팀에 실크송 비슷한 게임이\n오늘 출시됐다길래\n스스로 스트레스 만들러 가보겠습니다\nㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ\n귀여운 그림체에 그렇치 못한 난이도가 나오려나\n아니면 할만한 난이도가 나오려나....\n지금 정리해야할게 좀 많아서 정리하고 8시 안으로 키겠습니당!!!",
          "blindArticle": false,
          "commentCount": 232,
          "readCount": 6386,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": false,
          "hasLink": false,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 1315,
          "liked": false,
          "newArticle": false,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      },
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21381178,
          "cafeId": 27842958,
          "refArticleId": 21381178,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "Q6r9zdooAwLOTayf7c917g",
            "nickName": "비챤",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[비챤] 휴뱅챠니 🥹",
          "writeDateTimestamp": 1768985673157,
          "summary": "방송에서 말씀드린대로 오늘과 내일은 휴뱅입니다!\n일 뿌수고 오겠습니다 🔥🔥🔥🔥\n금요일에 만나요 헤헤 💚",
          "blindArticle": false,
          "commentCount": 239,
          "readCount": 3663,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": false,
          "hasLink": false,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 1250,
          "liked": false,
          "newArticle": false,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      },
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21380107,
          "cafeId": 27842958,
          "refArticleId": 21380107,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "l9iJSgswwB8TEtdfSWWV5HZqVwuYeenLwqD5uZSTZgo",
            "nickName": "주르르",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[주르르] 쭈니티팀과 함께 하실 개발자 분을 모집합니당!",
          "writeDateTimestamp": 1768930854427,
          "summary": "르르땅의 주니티 방송 컨텐츠를 도와주실 개발자 분을 모집하는 글입니다!\n관심있으신 분은 지원 부탁드려요~!\n* 필요사항\n- 타 작업량이 많지 않음\n- 유니티 개발, 소켓통신 친숙함\n- 멀티스레드 지식\n- 르르땅 방송을 자주본다\n- 기간을 잘 지킨다\n- 2년내 사라질 예정이 없음\n* 주요 업무\n- 주니티 개발 사항 Follow up\n- 새로운 컨텐츠마다 필요한 환경 세팅, 추가 개발 진행\n- 이슈 발생 시 같이 머리싸매서 해결 찾기\n- 깨부\n제목: [닉네임] 개발자 지원\n메일주소: junity0610@gmail.com\n내용: 포...",
          "blindArticle": false,
          "commentCount": 139,
          "readCount": 4461,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": false,
          "hasLink": false,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 1105,
          "liked": false,
          "newArticle": false,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      },
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21379989,
          "cafeId": 27842958,
          "refArticleId": 21379989,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "VLprTFWwjnkYxKqwN7exspDm4Jyqu_sB_kxlOWmDyTA",
            "nickName": "고세구",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[고세구] 스타 초보만",
          "writeDateTimestamp": 1768928664147,
          "summary": "https://cafe.naver.com/steamindiegame/21379984\n응 구라야 고수만 요기 글에 댓글 달아주시면 감사드립니당!",
          "blindArticle": false,
          "commentCount": 132,
          "readCount": 4705,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": false,
          "hasLink": true,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 999,
          "liked": false,
          "newArticle": false,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      },
      {
        "type": "ARTICLE",
        "item": {
          "articleId": 21379975,
          "cafeId": 27842958,
          "refArticleId": 21379975,
          "replyArticleCount": 0,
          "writerInfo": {
            "memberKey": "VLprTFWwjnkYxKqwN7exspDm4Jyqu_sB_kxlOWmDyTA",
            "nickName": "고세구",
            "memberLevel": 888,
            "memberLevelName": "카페 스탭",
            "memberLevelIconId": 1,
            "staff": true,
            "manager": false,
            "secedeMember": false
          },
          "menuId": 345,
          "readLevel": 1,
          "restrictMenu": false,
          "subject": "[고세구] 뜬금없는데 같이 공포 게임 하실 분...",
          "writeDateTimestamp": 1768928385040,
          "summary": "https://www.sooplive.co.kr/station/gosegu2/post/184413919\n숲 방송인 분들 중에서 혹시 내일이 아니라 오늘! (21일) 에 심심하신 분 계신다면...!\n같이 해봐요 헤헤 노잼이면 배그 스쿼드 해요~~!!!!! >ㅁ< 같이 놀아용!",
          "blindArticle": false,
          "commentCount": 141,
          "readCount": 4666,
          "hasCalender": false,
          "hasFile": false,
          "hasGpx": false,
          "hasImage": false,
          "hasLink": true,
          "hasMap": false,
          "hasMusic": false,
          "hasMovie": false,
          "hasPoll": false,
          "likeCount": 1008,
          "liked": false,
          "newArticle": false,
          "delParent": false,
          "marketArticle": false,
          "popular": false,
          "openArticle": true,
          "hasNewComment": true,
          "enableComment": true,
          "refArticle": false
        }
      }
    ],
    "pageInfo": {
      "lastNavigationPageNumber": 10,
      "visibleNextButton": true
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» result|object|true|none||none|
|»» articleList|[object]|true|none||none|
|»»» type|string|true|none||none|
|»»» item|object|true|none||none|
|»»»» articleId|integer|true|none||none|
|»»»» cafeId|integer|true|none||none|
|»»»» refArticleId|integer|true|none||none|
|»»»» replyArticleCount|integer|true|none||none|
|»»»» writerInfo|object|true|none||none|
|»»»»» memberKey|string|true|none||none|
|»»»»» nickName|string|true|none||none|
|»»»»» memberLevel|integer|true|none||none|
|»»»»» memberLevelName|string|true|none||none|
|»»»»» memberLevelIconId|integer|true|none||none|
|»»»»» staff|boolean|true|none||none|
|»»»»» manager|boolean|true|none||none|
|»»»»» secedeMember|boolean|true|none||none|
|»»»» menuId|integer|true|none||none|
|»»»» readLevel|integer|true|none||none|
|»»»» restrictMenu|boolean|true|none||none|
|»»»» subject|string|true|none||none|
|»»»» writeDateTimestamp|integer|true|none||none|
|»»»» summary|string|true|none||none|
|»»»» blindArticle|boolean|true|none||none|
|»»»» commentCount|integer|true|none||none|
|»»»» readCount|integer|true|none||none|
|»»»» hasCalender|boolean|true|none||none|
|»»»» hasFile|boolean|true|none||none|
|»»»» hasGpx|boolean|true|none||none|
|»»»» hasImage|boolean|true|none||none|
|»»»» hasLink|boolean|true|none||none|
|»»»» hasMap|boolean|true|none||none|
|»»»» hasMusic|boolean|true|none||none|
|»»»» hasMovie|boolean|true|none||none|
|»»»» hasPoll|boolean|true|none||none|
|»»»» likeCount|integer|true|none||none|
|»»»» liked|boolean|true|none||none|
|»»»» newArticle|boolean|true|none||none|
|»»»» delParent|boolean|true|none||none|
|»»»» marketArticle|boolean|true|none||none|
|»»»» popular|boolean|true|none||none|
|»»»» openArticle|boolean|true|none||none|
|»»»» hasNewComment|boolean|true|none||none|
|»»»» enableComment|boolean|true|none||none|
|»»»» refArticle|boolean|true|none||none|
|»»»» headId|integer|false|none||none|
|»»»» representImage|string|false|none||none|
|»»»» representImageType|string|false|none||none|
|»» pageInfo|object|true|none||none|
|»»» lastNavigationPageNumber|integer|true|none||none|
|»»» visibleNextButton|boolean|true|none||none|

# 数据模型

