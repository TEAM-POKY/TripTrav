package com.www.triptrav.domain;

import lombok.*;
import lombok.extern.slf4j.Slf4j;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class PathVO {
    private long contentId;
    private String firstImage;
}