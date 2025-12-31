import { Link } from 'react-router-dom';
import { RiSparklingFill } from '@remixicon/react';
import { Bubble } from '@ant-design/x';

export default function PlanHelper() {
    return (
        <div className="relative min-h-[calc(100vh-72px)] w-full bg-[rgb(255_255_255/0.45)] px-32 py-24">
            <Link
                to="document-list"
                className="rd-full b b-solid b-white center absolute top-48 right-48 mx-auto w-160 px-24 py-12"
                style={{
                    background:
                        "linear-gradient(137deg, rgba(255, 255, 255, 0.30) 11.08%, rgba(248, 250, 255, 0.60) 39.07%, rgba(245, 248, 255, 0.90) 57.16%, rgba(255, 255, 255, 0.20) 95.9%)",
                    boxShadow:
                        "-1px -4px 9.075px 0px #FFF inset, 1px 4px 6px 0px rgba(209, 214, 255, 0.30) inset, 0px 8px 16px 0px rgba(123, 129, 190, 0.12)",
                }}
            >
                <div>
                    <RiSparklingFill className="size-20 text-indigo-500" />
                </div>
                <div className="ml-2 font-medium text-base text-indigo-500">文件列表</div>
            </Link>

            <div
                className="h-440 p-32 bg-pink-50"
                style={{
                    backgroundSize: "100% 100%",
                }}
            >
                {/* <div className="text-center font-400 text-48 text-shadow-lg text-slate-700">试试选择您的专属知识问答</div> */}

            </div>

            {/* 测试antdx */}
            <div className="App">
                <Bubble content="Hello world!" />
            </div>

        </div>
    );
}
