import { HttpException, HttpStatus } from "@nestjs/common";

//id:ASC,name:DESC --> string
//-->{ id:ASC, nanem:DESC }
export const convertStringSortToObject = (sort:string)=>{
    try {
        const sortArray = sort.split(',');// ["createdAt:DESC", "name:ASC"]

        return Object.fromEntries(
            sortArray.map( (e) => [e.split(':')[0],e.split(':')[1]] ) // [["createdAt", "DESC"], ["name", "ASC"]]
        )
    } catch (error) {
        throw new HttpException(error.message,HttpStatus.BAD_REQUEST)
    }
}

export const convertKeySortManuscript = (sortObj:any)=>{
    const sortConverted = {};
    for(const key of Object.keys(sortObj)){ //trả về một mảng chứa tất cả các khóa của sortObj: ['salary', 'title']
        if(key === 'salary'){
            sortConverted['manuscript.maxSalary'] = sortObj[key];
        }
        if(key === 'title'){
            sortConverted['manuscript.title'] = sortObj[key];
        }
    }

    return sortConverted;   
}