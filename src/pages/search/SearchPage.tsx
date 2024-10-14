import React from "react";
import MainLayout from "@/layouts/main";
import SearchMenu from "@/components/search/SearchMenu";
import SearchMain from "@/components/search/SearchMain";

const SearchPage = () => {
  return (
    <MainLayout
      leftComponent={<SearchMenu />} // 왼쪽: 검색 메뉴
      centerComponent={<SearchMain />} // 중앙 및 오른쪽 영역 통합: 검색 메인
      isCustom={true} // centerComponent와 rightComponent를 합친 Custom 사용
    />
  );
};

export default SearchPage;
