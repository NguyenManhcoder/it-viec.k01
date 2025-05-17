import { ApiProperty } from "@nestjs/swagger";
import {  IsNotEmpty, IsString } from "class-validator";

export class refreshTokenDto{
    @ApiProperty({example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwidXNlcm5hbWUiOiJ1c2VyIiwibG9naW5UeXBlIjoiRU1BSUwiLCJyb2xlIjoiQVBQTElDQU5UIiwiaWF0IjoxNzQ3MjQyNTU4LCJleHAiOjE3NDc4NDczNTh9.v-u_HNFjcsTFDappkCz5rU0561K-yZeq4mt7NDDDTek'})
    @IsString()
    @IsNotEmpty()
    refreshToken:string;
}